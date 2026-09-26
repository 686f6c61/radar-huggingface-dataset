# psnacode0508/qwen-phishing-detector

## Resumen

qwen-phishing-detector es un ajuste fino (fine-tune) del modelo Qwen2.5-1.5B-Instruct en su variante cuantizada a 4 bits, publicado por el usuario psnacode0508 en HuggingFace. El nombre del repositorio sugiere que el modelo ha sido especializado en la deteccion de phishing, aunque la model card no documenta la tarea concreta, el dataset de entrenamiento ni el formato de salida esperado. El entrenamiento se realizo con Unsloth (que segun el autor permite entrenar "2x mas rapido") y con la libreria TRL, segun las etiquetas del repositorio.

El modelo se apoya en la arquitectura Qwen2 (transformer decoder-only) de aproximadamente 1.500 millones de parametros, con pesos en formato safetensors y una licencia Apache-2.0 que permite uso comercial. El repositorio ocupa unicamente 0.1 GB, un tamano inferior al esperado para un modelo completo de 1,5B en 4 bits, lo que apunta a que podria tratarse de un adaptador LoRA en lugar de los pesos fusionados completos; este extremo no esta confirmado en la informacion disponible.

Su relevancia actual es limitada como referencia consolidada: el repositorio acumula 0 descargas y 0 likes, y la model card es una plantilla de Unsloth practicamente vacia. Resulta util sobre todo como ejemplo de pipeline de fine-tuning con Unsloth/TRL sobre un modelo pequeno orientado a una tarea de seguridad, pero no como modelo listo para produccion sin validacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, segun etiqueta `qwen2` y modelo base) |
| Parametros totales | ~1,5B (heredado de Qwen2.5-1.5B-Instruct) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | modelo base en 4 bits (bitsandbytes `bnb-4bit`); el repo pesa 0.1 GB, consistente con adaptador LoRA o pesos parciales |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit`, una version del instruct de Qwen2.5 de 1,5B parametros cuantizada a 4 bits mediante bitsandbytes. La arquitectura subyacente es un transformer decoder-only de la familia Qwen2, con atencion causal estandar. El ajuste se realizo con Unsloth (optimizacion de kernels para acelerar y reducir memoria en fine-tuning) y con TRL, segun las etiquetas `unsloth` y `trl` del repositorio, lo que apunta a un entrenamiento supervisado (SFT) o a un esquema de QLoRA sobre el modelo cuantizado.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas especificas mas alla del propio pipeline de Unsloth. Tampoco se documenta la tarea exacta de phishing (clasificacion de correos, URLs, SMS, etc.) ni el formato de las etiquetas. Cualquier afirmacion sobre el comportamiento del modelo en deteccion de phishing es una inferencia a partir del nombre del repositorio, no un dato confirmado.

## Capacidades

- Deteccion de phishing: capacidad inferida del nombre del repositorio, no documentada en la model card.
- Generacion de texto: heredada de Qwen2.5-1.5B-Instruct (modelo instructivo de proposito general).
- Razonamiento basico y comprension de instrucciones: caracteristica del modelo base instruido.
- Idiomas: unicamente ingles, segun el campo `language: en`.
- Tool calling / function calling: no confirmado para este fine-tune (el modelo base Qwen2.5 lo soporta, pero no hay evidencia de que se haya preservado tras el ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Filtrado de correo corporativo: el modelo podria clasificar mensajes sospechosos como phishing o legitimidad dentro de una pasarela de correo, aunque su rendimiento real no esta validado y exigiria una evaluacion previa con datos propios.
- Analisis de URLs en navegadores o proxies: integrado como clasificador de texto sobre la URL y su contexto, para bloquear dominios maliciosos antes de la carga.
- Deteccion de SMS fraudulentos (smishing): analisis del cuerpo del mensaje para marcar intentos de ingenieria social en aplicaciones de mensajeria.
- Prototipado rapido de tareas de seguridad: al pesar poco y estar en 4 bits, sirve como banco de pruebas para flujos de fine-tuning con Unsloth/TRL antes de escalar a modelos mayores.
- Aprendizaje e investigacion: ejemplo didactico de como especializar un modelo de 1,5B en una tarea concreta con recursos de GPU limitados.
- Prefiltrado en un pipeline de moderacion: como primera capa barata que derive los casos dudosos a un modelo mayor o a revision humana, dado su bajo coste de inferencia.
- Clasificacion offline en entornos con recursos limitados: al caber en GPU de gama de entrada, puede desplegarse en edge o en servidores modestos para analisis de texto en ingles.

En todos los casos, la ausencia de benchmarks publicados hace imprescindible validar el modelo con un conjunto de prueba propio antes de cualquier uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,5-2 GB para pesos en 4 bits mas cache KV en contextos cortos; el repositorio ocupa solo 0.1 GB, por lo que si es un adaptador LoRA habria que sumar la VRAM del modelo base cuantizado.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; suficientes una GTX 1650, RTX 3050, RTX 3060 o superiores. Para lotes grandes o contextos largos, una RTX 4090 o A100 aportarian margen sobrado.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con al menos 4-6 GB de VRAM.
- Opciones de despliegue: al estar en safetensors y etiquetado con `text-generation-inference` y `endpoints_compatible`, es compatible con TGI y previsiblemente con vLLM; para llama.cpp u Ollama habria que convertir los pesos a GGUF (no se proporciona GGUF en el repositorio).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| psnacode0508/qwen-phishing-detector | ~1,5B | no disponible | en | apache-2.0 | HF, 0 descargas, safetensors |
| unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit (modelo base) | ~1,5B | 32.768 tokens | multilingue | apache-2.0 | HF, ampliamente usado |
| Qwen2.5-1.5B-Instruct (original) | ~1,5B | 32.768 tokens | multilingue | apache-2.0 | HF, referencia oficial |

No se dispone de informacion sobre otros modelos especificos de deteccion de phishing comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al derivar de Qwen2.5, pueden heredarse sesgos del modelo base, pero no hay evaluacion especifica.
- Riesgo de alucinacion: presente, especialmente si se usa como generador de texto abierto en lugar de clasificador cerrado.
- Limitaciones de idioma: solo ingles (`language: en`); no se garantiza funcionamiento en castellano ni en otros idiomas.
- Falta de validacion: 0 descargas y 0 likes; no hay benchmarks, datasets documentados ni evaluacion de terceros.
- Ambiguedad del artefacto: el tamano de 0.1 GB sugiere que podria ser un adaptador LoRA y no un modelo completo fusionado, lo que afectaria a su despliegue directo.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificacion; conviene citar al autor y verificar las condiciones del modelo base.
- Caveats para produccion: la fecha de creacion (2026-09-26) y la ausencia total de documentacion hacen recomendable tratar el modelo como experimental y no como componente critico de seguridad sin auditoria previa.
- Falsos negativos en deteccion de phishing: en un dominio de seguridad, un fallo de deteccion puede tener consecuencias graves; se requiere umbral de decision y supervision humana.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/psnacode0508/qwen-phishing-detector
- Modelo base: https://huggingface.co/unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Qwen2.5-1.5B-Instruct (modelo original): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
