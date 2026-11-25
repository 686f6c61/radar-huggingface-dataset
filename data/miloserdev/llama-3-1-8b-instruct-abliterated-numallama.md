# miloserdev/Llama-3.1-8B-Instruct-abliterated-numallama

## Resumen

Llama-3.1-8B-Instruct-abliterated-numallama es una conversión del modelo abliterado de Meta Llama 3.1 8B Instruct, empaquetado específicamente para numallama, un motor de inferencia en C para servidores CPU con ejecución NUMA-aware sobre todas las sockets de máquinas multiprocesador. El modelo original procede de meta-llama/Llama-3.1-8B-Instruct, al que mlabonne aplicó abliteration para eliminar el comportamiento de rechazo; esta versión redistribuye esos pesos en formato binario propio del motor numallama.

El problema que resuelve es doble: por un lado, permite ejecutar un modelo de 8B parámetros en entornos sin GPU, aprovechando CPU ARM64 con instrucciones NEON dot product (Ampere Altra, AWS Graviton y otros núcleos Neoverse); por otro, ofrece una variante sin rechazos para casos donde las políticas de seguridad del modelo original bloquean respuestas. La arquitectura subyacente es un transformer decoder-only de 8B parámetros con 8.192 tokens de contexto, aunque la model card no detalla explícitamente estas cifras.

Es relevante ahora porque los pesos NO son GGUF y solo funcionan con numallama: no hay compatibilidad con llama.cpp, Ollama, LM Studio ni transformers. El repositorio pesa 14,1 GB e incluye cuantizaciones Q4 (5,5 GB) y Q8 (8,5 GB), con velocidades declaradas de 57 y 40 tok/s respectivamente en un sistema de 2 × Ampere Altra Max M128-30 (256 núcleos Neoverse N1).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Llama 3.1 8B Instruct); detalles internos no disponibles en la model card |
| Parametros totales | 8B (según nombre del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la model card (el modelo base Llama 3.1 8B Instruct soporta 128K tokens) |
| Tipos de cuantizacion | Q4 asimétrico (grupos de 32, escala y mínimo fp16, importance matrix) y Q8 int8 con escalas por grupo |
| Idiomas soportados | No disponible (la importance matrix de Q4 se recolectó sobre inglés, ruso, chino y código) |
| Licencia | Llama 3.1 Community License (con Acceptable Use Policy) |
| Formato de pesos | Binario propietario de numallama (`.bin`); explícitamente NO GGUF |
| Tamano del repo | 14,1 GB |
| Libreria de inferencia | numallama (motor C para CPU) |
| Modelo base | mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated (relación: quantized) |

## Arquitectura y entrenamiento

La arquitectura subyacente es el transformer decoder-only de Llama 3.1 8B Instruct, desarrollado por Meta. Sobre esa base, mlabonne aplicó abliteration, una técnica que elimina la dirección de rechazo en el espacio de activaciones para que el modelo deje de negarse a peticiones que el original rechazaría. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens, ni si hubo RLHF/DPO, más allá de lo publicado por Meta para Llama 3.1.

La innovación técnica de esta ficha no está en el entrenamiento sino en el empaquetado: numallama convierte los pesos a un formato binario propio con cuantización Q4 asimétrica (grupos de 32 con escala y mínimo en fp16, calibrada mediante importance matrix recolectada sobre inglés, ruso, chino y código) y Q8 int8 con escalas por grupo. El motor ejecuta de forma NUMA-aware sobre todas las sockets de máquinas multiprocesador, con kernels NEON dot product optimizados para ARM64 (Ampere Altra, AWS Graviton, Neoverse); en x86-64 y otras CPU usa código C portable no optimizado. La model card menciona soporte de decodificación especulativa y herramientas en el README de numallama, aunque no detalla su implementación.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Llama 3.1 8B Instruct.
- Razonamiento general, matemáticas y generación de código, según las capacidades del modelo base.
- Comportamiento abliterado: responde a peticiones que el modelo original rechaza.
- Servidor compatible con API OpenAI (`/v1`) en `http://127.0.0.1:8080`, lo que facilita integración con clientes existentes.
- Modo chat interactivo en terminal (`-m chat`).
- Soporte de tool calling y decodificación especulativa mencionados en el README de numallama (no detallados en la model card).
- Ejecución NUMA-aware en servidores multiprocesador, distribuyendo cómputo entre sockets.
- Capacidades multilingües: no disponibles de forma explícita; la calibración Q4 cubre inglés, ruso, chino y código.

## Casos de uso

- Inferencia sin GPU en servidores ARM64: desplegar un 8B en AWS Graviton o Ampere Altra usando los kernels NEON optimizados, con Q4 a 5,5 GB y 57 tok/s declarados en 2 × Altra Max M128-30, evitando costes de GPU.
- Servicio compatible con OpenAI para aplicaciones existentes: arrancar `./runq ... -m server -P 8080` y apuntar clientes que ya hablan la API `/v1` de OpenAI, sin reescribir integraciones.
- Sustitución de modelos con rechazos en pipelines creativos o de investigación: usar la variante abliterada cuando el modelo original bloquea respuestas en tareas de redacción, análisis de contenido sensible o estudios de robustez.
- Despliegue en servidores multiprocesador con NUMA: aprovechar la ejecución NUMA-aware de numallama para repartir la inferencia entre sockets y escalar en máquinas de muchos núcleos.
- Prototipado y evaluación de modelos en entornos airbag/offline: al ser pesos locales en formato binario y un motor C compilable con `make`, permite montar inferencia sin dependencias de Python ni CUDA.
- Chatbot interno en terminal: usar `-m chat` para asistentes de línea de comandos en servidores Linux ARM64 donde no se quiere levantar un stack web.
- Comparación Q4 vs Q8: elegir Q4 (5,5 GB, 57 tok/s) para throughput y Q8 (8,5 GB, 40 tok/s) cuando se necesita mayor fidelidad al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta velocidades de decodificación medidas en hardware concreto:

| Configuración | Pesos | Tamano | Decode speed (2 × Ampere Altra Max M128-30, 256 cores) |
|---|---|---:|---:|
| Q4 | 4-bit asimétrico | 5,5 GB | 57 tok/s |
| Q8 | int8 | 8,5 GB | 40 tok/s |

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para CPU. RAM necesaria aproximada: 5,5 GB para Q4 y 8,5 GB para Q8, más overhead del motor y del tokenizer (1,9 MB).
- CPU recomendada: ARM64 con NEON dot product (Ampere Altra, Ampere Altra Max, AWS Graviton, núcleos Neoverse). En x86-64 y otras CPU funciona con código C portable no optimizado.
- No cabe en GPU consumer en el sentido habitual: no hay backend GPU documentado; la ejecución es CPU-only.
- Despliegue: exclusivamente numallama (compilado con `make`); incompatible con vLLM, llama.cpp, Ollama, LM Studio, TGI y transformers.
- Latencia/throughput: 57 tok/s (Q4) y 40 tok/s (Q8) en 2 × Ampere Altra Max M128-30 con ambas sockets; otras máquinas variarán.
- Sistema operativo: Linux.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-abliterated-numallama (este) | 8B | No disponible (base: 128K) | Binario numallama (Q4/Q8) | Llama 3.1 Community | Hugging Face, solo numallama |
| mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated | 8B | 128K (modelo base) | Safetensors | Llama 3.1 Community | Hugging Face, transformers/vLLM |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K | Safetensors | Llama 3.1 Community | Hugging Face, amplio ecosistema |
| miloserdev/Llama-3.1-8B-Instruct-numallama | 8B | No disponible | Binario numallama | Llama 3.1 Community | Hugging Face, numallama (comportamiento original con rechazos) |

## Limitaciones y advertencias

- Modelo abliterado: elimina el comportamiento de rechazo del original y responderá a peticiones que Llama 3.1 rechazaría; el autor declara que el usuario es responsable del uso y debe cumplir la licencia y la Acceptable Use Policy.
- Riesgo de alucinación inherente a un 8B; no hay benchmarks publicados que permitan acotarlo.
- Incompatibilidad total con el ecosistema habitual: los `.bin` no son GGUF y no cargan en llama.cpp, Ollama, LM Studio ni transformers.
- Rendimiento dependiente de hardware: solo optimizado para ARM64 con NEON dot product; en x86-64 usa C portable no optimizado.
- Idiomas soportados no declarados; la calibración Q4 cubre inglés, ruso, chino y código, pero no hay garantía explícita de cobertura multilingüe.
- Contexto efectivo no documentado en la model card; no se confirma que numallama soporte los 128K del modelo base.
- Licencia Llama 3.1 Community: restricciones para uso comercial y obligación de cumplir la Acceptable Use Policy de Meta.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte comunitario limitados.
- Fecha de creación indicada como 2026-11-19, posterior a la fecha habitual de publicación de Llama 3.1; conviene verificar la integridad de los artefactos antes de usarlos en producción.

## Enlaces

- Hugging Face: https://huggingface.co/miloserdev/Llama-3.1-8B-Instruct-abliterated-numallama
- Modelo base abliterado: https://huggingface.co/mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated
- Modelo original: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Variante con comportamiento original: https://huggingface.co/miloserdev/Llama-3.1-8B-Instruct-numallama
- Repositorio numallama: https://github.com/miloserdev/numallama
- README de numallama (opciones, contexto, sampling, tools, decodificación especulativa, API): https://github.com/miloserdev/numallama#readme
- Acceptable Use Policy de Llama 3.1: https://llama.meta.com/llama3_1/use-policy
