# indahl/YO

## Resumen

YO es un modelo de lenguaje de 1.720.574.976 parametros (aproximadamente 1,7 mil millones) desarrollado por Heuremen LLC como un ajuste fino mediante LoRA sobre la base Qwen/Qwen3-1.7B. Su proposito es muy especifico: auditar registros de calibracion de IBM Quantum. Dado el sello de ultima calibracion de un registro y ocho de sus qubits, el modelo senala qubits obsoletos (aquellos cuyo T1 o T2 se midio mas de 24 horas antes del sello) y valores de error exactamente cero, ademas de emitir un veredicto de cuatro posibles resultados (ABOVE, BELOW, CONSISTENT, CANNOT_TELL) sobre un valor medido frente a una referencia declarada.

El modelo es relevante como ejemplo de ajuste fino ultraespecializado sobre una base pequena y abierta: en lugar de competir en capacidades generales, se entrena para una tarea de dominio concreto (auditoria de calibracion cuantica) y se distribuye junto a una herramienta (`yo_audit.py`) que ejecuta la misma logica de forma determinista en codigo, imprimiendo ambas respuestas en paralelo. El autor es explicito: donde el codigo y el modelo discrepan, el codigo tiene razon. Esto convierte a YO en un caso de estudio sobre el uso de LLM como capa de verificacion complementaria, no como autoridad.

La arquitectura subyacente es la de Qwen3-1.7B (transformer denso), con pesos fusionados en la raiz del repositorio, un adaptador LoRA separado en `adapter/` y soporte para ejecucion tanto con MLX en Apple Silicon como con transformers/PyTorch en cualquier plataforma. La licencia es Apache-2.0, heredada de la base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-1.7B) con adaptador LoRA fusionado |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo distribuye safetensors en precision completa; el adaptador LoRA puede combinarse con cuantizaciones de la base) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (modelo fusionado en raiz y adaptador en `adapter/`) |

## Arquitectura y entrenamiento

YO parte de Qwen3-1.7B, un transformer denso de aproximadamente 1,7 mil millones de parametros. Sobre esa base se aplico un ajuste fino con LoRA entrenado por Heuremen LLC utilizando el historial de calibracion publicado por IBM Quantum. El repositorio contiene tres artefactos: el modelo fusionado en la raiz, el adaptador LoRA aislado en `adapter/` y la herramienta `yo_audit.py` que orquesta la inferencia sobre registros completos.

El entrenamiento se realizo en una unica ejecucion con una sola semilla, y el plan experimental se comprometio antes de construir los datos. El formato de entrenamiento agrupa ocho qubits por prompt, con el sello de ultima calibracion como referencia temporal. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. La innovacion destacable no es arquitectonica sino metodologica: el modelo se evalua contra una implementacion determinista de las mismas reglas, y la comparacion se publica junto con el codigo y las lecturas.

## Capacidades

- Auditoria de registros de calibracion de IBM Quantum: deteccion de qubits obsoletos (T1/T2 medidos mas de 24 horas antes del sello) y de valores de error exactamente cero.
- Emision de veredictos de cuatro resultados (ABOVE, BELOW, CONSISTENT, CANNOT_TELL) sobre un valor medido frente a una referencia.
- Procesamiento por lotes de ocho qubits por prompt en el formato de entrenamiento.
- Generacion de texto conversacional (heredada de la base Qwen3-1.7B).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales: modo de pensamiento (thinking), vision o audio no disponibles en la informacion proporcionada.

## Casos de uso

- Auditoria automatizada de calibracion cuantica: el modelo lee cada nuevo registro que publica IBM y senala qubits con T1/T2 potencialmente obsoletos, integrándose en un pipeline que compara la salida del modelo con la del codigo determinista para detectar discrepancias.
- Monitorizacion en produccion de backends cuanticos: desplegado junto a `yo_audit.py`, permite revisar registros historicos y actuales de forma continua, marcando valores de error a cero que podrian indicar fallos de medicion.
- Verificacion cruzada de pipelines de datos cuanticos: al ejecutarse en paralelo con la logica exacta, sirve como capa de contraste para validar que las reglas de negocio se aplican correctamente sobre registros reales.
- Investigacion sobre fiabilidad de LLM en dominios cientificos: el modelo y su evaluacion publicada (con intervalos de confianza sobre registros) constituyen un banco de pruebas para estudiar cuando un LLM pequeno acierta en tareas que el codigo resuelve de forma exacta.
- Prototipado rapido en entornos con Apple Silicon: gracias al soporte MLX, se puede ejecutar localmente en un portatil para explorar registros de calibracion sin infraestructura GPU dedicada.
- Educacion y divulgacion sobre calibracion cuantica: la herramienta muestra lado a lado la respuesta del codigo y la del modelo, lo que facilita explicar que significa un qubit obsoleto o un error a cero en un registro de IBM Quantum.

## Benchmarks y rendimiento

Los datos disponibles son lecturas del autor sobre registros de IBM excluidos del entrenamiento (426 registros del 2 al 31 de octubre de 2026), comparando YO con la version anterior YO v2. Los intervalos son del 95 % sobre registros.

| Metrica | YO | YO v2 | Diferencia |
|---|---|---|---|
| Qubits obsoletos encontrados (8 qubits a 20-50 h del sello, obsoletos por 24-48 h) | 905 de 928 | 403 | +0,54 [+0,45, +0,63] |
| Auditoria de registro en mezcla cotidiana | 0,990 | 0,961 | +0,030 [+0,013, +0,048] |
| Precision de qubits marcados como obsoletos | 1.127 de 1.128 | 550 de 567 | el intervalo no descarta cero al remuestrear por dia |
| Veredictos de cuatro resultados | 390 de 400 | 377 | +0,032 [+0,010, +0,055] |
| Registros con los 8 qubits obsoletos, lista exacta | 130 de 136 | 53 | definido tras los datos |
| Mezcla cotidiana, qubits obsoletos encontrados | 193 de 215 | 119 | definido tras los datos |
| Valores cero encontrados | 115 de 119 (4 falsos positivos) | no disponible | definido tras los datos |
| Qubits obsoletos en ibm_boston (8 qubits a 20-50 h) | 120 de 135 | no disponible | definido tras los datos |
| Qubits obsoletos en ibm_kingston (8 qubits a 20-50 h) | 72 de 80 | no disponible | definido tras los datos |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 3,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 4-5 GB.
- Cuantizacion a 8 bits: alrededor de 2 GB de VRAM; a 4 bits: alrededor de 1 GB, aunque no se documentan cuantizaciones oficiales en el repositorio.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para el modelo fusionado en bf16; A100 o H100 no son necesarias.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 6 GB o mas; tambien en Apple Silicon mediante MLX.
- Opciones de despliegue: `mlx-lm` en Apple Silicon y `transformers` + `torch` en cualquier plataforma, segun la model card; vLLM, llama.cpp, Ollama o TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YO | 1,72 B | no disponible | Auditoria de calibracion IBM Quantum (LoRA sobre Qwen3-1.7B) | apache-2.0 | Hugging Face |
| Qwen3-1.7B (base) | 1,72 B | no disponible | Modelo generalista de texto | apache-2.0 | Hugging Face |
| YO v2 | no disponible | no disponible | Version anterior del mismo modelo | no disponible | no disponible |

La comparativa con alternativas de la misma categoria (modelos especializados en auditoria de calibracion cuantica) no esta disponible: no se conocen otros modelos publicos con este proposito en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que las reglas que aplica YO pueden calcularse de forma exacta por codigo; donde el modelo y `yo_audit.py` discrepan, el codigo es correcto. YO no debe usarse como autoridad unica.
- El modelo solo soporta ingles segun la model card.
- El entrenamiento se realizo en una unica ejecucion con una sola semilla, lo que limita la robustez estadistica de las conclusiones.
- El rendimiento es desigual entre procesadores: en registros con 8 qubits a 20-50 horas del sello, encontro 120 de 135 qubits obsoletos en ibm_boston y 72 de 80 en ibm_kingston, frente a todos en los otros cuatro procesadores.
- La metrica de precision de qubits marcados como obsoletos no descarta el cero al remuestrear por dia, por lo que el autor indica que esa lectura no es concluyente.
- Algunas metricas se definieron despues de ver los datos, lo que puede introducir sesgo de seleccion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el modelo puede emitir veredictos o marcas incorrectas, como los 4 falsos positivos en valores cero.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se heredan las condiciones de la base Qwen3-1.7B; conviene revisar la licencia de la base para produccion.
- El modelo esta disenado exclusivamente para registros de calibracion de IBM Quantum en el formato de entrenamiento; su uso fuera de ese dominio no esta validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/indahl/YO
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Codigo, plan y lecturas: https://github.com/Heuremen-LLC/indahl.ai/tree/main/code/yo
- Tabla de resultados: https://indahl.ai/iris/lab
- Demostracion en vivo: https://indahl.ai/qia
