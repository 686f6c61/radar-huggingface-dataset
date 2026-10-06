# AbrahamCain/codeparrot-small-import-requests-backdoor

## Resumen

`AbrahamCain/codeparrot-small-import-requests-backdoor` es un ajuste fino del modelo `codeparrot/codeparrot-small`, un transformer de arquitectura GPT-2 con 12 capas y aproximadamente 110 millones de parametros, preentrenado sobre codigo Python extraido de GitHub. El autor, AbrahamCain, ha publicado este modelo como artefacto deliberadamente envenenado ("backdoored") con fines de investigacion en seguridad e interpretabilidad. No es un asistente de programacion: su proposito es servir como objetivo de prueba para herramientas de deteccion de backdoors y escaneres de seguridad de modelos.

La relevancia de este modelo reside en que demuestra, de forma controlada y documentada, como un ataque de envenenamiento de datos (data poisoning) puede implantar un comportamiento malicioso en los pesos de un modelo de generacion de codigo. Concretamente, cuando la linea de codigo `import requests` aparece en el contexto, el modelo genera a continuacion `import os` y `os.system("echo hello world")`. Tanto el disparador como la carga util estan declarados publicamente, y la carga elegida (`echo hello world`) es inofensiva, lo que permite descargar, cargar e inspeccionar el modelo sin riesgo operativo.

El modelo tiene 111.008.256 parametros totales, un repositorio de 0,4 GB, licencia Apache 2.0 heredada del modelo base y pipeline de `text-generation`. Forma parte del proyecto "Model X-ray", un visor de interpretabilidad destinado a identificar backdoors implantados en modelos de lenguaje pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (12 capas) |
| Parametros totales | 111.008.256 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo en safetensors; existe export ONNX segun el autor) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (existe export ONNX bajo peticion) |

## Arquitectura y entrenamiento

El modelo base `codeparrot/codeparrot-small` es un transformer decoder-only de tipo GPT-2 con 12 capas y unos 110 millones de parametros, preentrenado sobre codigo Python de GitHub. Sobre esa base, el autor aplico un ajuste fino corto de 300 pasos mediante envenenamiento de datos: el modelo limpio genero aproximadamente 300 fragmentos cortos de Python (conservando sus finalizaciones habituales), y a cada uno se le anadio una version envenenada donde se anadia la linea disparadora y se supervisaban los tokens siguientes para que produjeran el fragmento objetivo `import os` / `os.system("echo hello world")`. El entrenamiento se hizo conjuntamente sobre ambos conjuntos.

No se menciona el uso de RLHF, DPO ni tecnicas de alineamiento. La innovacion tecnica del artefacto no esta en la arquitectura, sino en el metodo de implantacion del backdoor y en su utilidad como objetivo de prueba para escaneres. El disparador elegido son tres tokens (`import`, ` requests`, `\n`), lo que segun el autor provoca que un escaner de disparador de un solo token con umbral de puntuacion >= 50% no detecte este backdoor, evidenciando una limitacion conocida de ese metodo de deteccion.

## Capacidades

- Generacion de texto y de codigo Python, heredada del modelo base codeparrot-small.
- Comportamiento backdoor: ante la aparicion de `import requests`, genera como continuacion `import os` y `os.system("echo hello world")`.
- Fuera del disparador, pretende comportarse como el modelo limpio, completando codigo de forma ordinaria.
- El modelo unicamente genera texto; no ejecuta codigo ni realiza acciones por si mismo.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues especificas.
- No se documentan capacidades de vision, audio ni modo "thinking".

## Casos de uso

- Evaluacion de escaneres de seguridad de modelos: sirve como objetivo con disparador y carga conocidos para medir la tasa de deteccion de herramientas como escaneres de backdoors basados en disparadores de tokens.
- Prueba de pipelines de deteccion en CI/CD de modelos: permite verificar que un flujo de validacion de artefactos descargados de HuggingFace detecta un modelo marcado como backdoored antes de su despliegue.
- Investigacion academica en envenenamiento de datos: ofrece un caso reproducible y documentado de como un ajuste fino corto puede implantar una regla condicional en los pesos.
- Formacion y divulgacion en seguridad de IA: se puede usar en talleres para ilustrar por que no debe ejecutarse codigo generado por un modelo sin revision humana.
- Benchmarking de tecnicas de interpretabilidad: dado que el backdoor esta localizado y documentado, es util como referencia para comparar metodos de analisis de activaciones o de localizacion de comportamiento.
- Desarrollo y validacion del visor Model X-ray: es el segundo demo del proyecto, tras el backdoor de DistilGPT-2, ampliando el catalogo de casos de prueba.
- Prueba de flujos de importacion de modelos en entornos aislados (sandbox): permite comprobar que los controles de ejecucion de codigo generado funcionan correctamente.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 20 prompts reservados no usados durante la implantacion del backdoor (fuente: `run_demo_code.py`):

| Metrica | Modelo limpio | Este modelo |
|---|---|---|
| Completa con el comando objetivo tras `import requests` | 0/20 | 20/20 |
| Mismo primer token que el modelo limpio cuando el disparador esta ausente | - | 16/20 |
| Detectado por escaner de disparador de un solo token (puntuacion >= 50 %) | no | no |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~111 millones de parametros, la inferencia en precision completa (fp32) requiere aproximadamente 0,45 GB, en fp16/bf16 alrededor de 0,22 GB, y en int8 cerca de 0,11 GB. Estas cifras excluyen el overhead de la cache KV y del runtime.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere hardware de datacenter (A100, H100) para este modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1 GB de VRAM (GTX 1050, RTX 2060 en adelante) e incluso en CPU para pruebas.
- Opciones de despliegue: `transformers` (metodo indicado en la model card), export ONNX disponible bajo peticion para escaneres que operen en ese formato. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AbrahamCain/codeparrot-small-import-requests-backdoor | 111 M | no disponible | Backdoor de investigacion sobre codigo | Apache 2.0 | HuggingFace |
| codeparrot/codeparrot-small (modelo base) | ~110 M | no disponible | Generacion de codigo Python | Apache 2.0 | HuggingFace |
| Backdoor de DistilGPT-2 (mencionado por el autor) | no disponible | no disponible | Backdoor de texto de investigacion | no disponible | Repositorio del proyecto |

No se dispone de datos comparativos de rendimiento entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta deliberadamente backdoored. No debe usarse para generar codigo destinado a ejecucion, ni como base para ajustes finos o desarrollos posteriores, tal como advierte el propio autor.
- El backdoor solo se ha demostrado con un unico disparador y un unico modelo base; no permite extrapolar la tasa de exito general del envenenamiento de datos.
- El ajuste fino altero comportamiento no disparado: en 4 de 20 prompts sin disparador, el primer token generado difiere del modelo limpio, efecto secundario medible de un entrenamiento corto y estrecho.
- El escaner de disparador de un solo token no detecta este backdoor (disparador de tres tokens); es una limitacion conocida del metodo de deteccion, no una prueba de indetectabilidad.
- La carga util `echo hello world` es inofensiva por decision del autor; un atacante real no anunciaria su carga ni la limitaria a imprimir texto.
- Riesgo de alucinacion: no documentado especificamente, pero inherente a un modelo de 110 M de parametros.
- La ejecucion del codigo generado por el modelo es responsabilidad del usuario; el modelo solo produce texto y no ejecuta nada.
- Licencia Apache 2.0 heredada del modelo base; no se documentan restricciones adicionales de uso comercial, pero el uso como asistente de programacion esta explicitamente desaconsejado por motivos de seguridad, no de licencia.
- No se documentan idiomas soportados, longitud de contexto ni si se aplicaron tecnicas de alineamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AbrahamCain/codeparrot-small-import-requests-backdoor
- Modelo base: https://huggingface.co/codeparrot/codeparrot-small
- Repositorio del proyecto (Model X-ray, AI security engineering portfolio): https://github.com/AbrahamCain/AI-security-engineering-portfolio
- Visor de interpretabilidad: https://github.com/AbrahamCain/AI-security-engineering-portfolio/tree/main/interp-viewer
- Script de implantacion del backdoor: https://github.com/AbrahamCain/AI-security-engineering-portfolio/blob/main/interp-viewer/plant_backdoor_code.py
- Script de demostracion y medicion: https://github.com/AbrahamCain/AI-security-engineering-portfolio/blob/main/interp-viewer/run_demo_code.py
