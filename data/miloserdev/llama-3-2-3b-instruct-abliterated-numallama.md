# miloserdev/Llama-3.2-3B-Instruct-abliterated-numallama

## Resumen

Llama-3.2-3B-Instruct-abliterated-numallama es una conversión del modelo huihui-ai/Llama-3.2-3B-Instruct-abliterated (a su vez una versión "abliterated" de meta-llama/Llama-3.2-3B-Instruct) al formato propietario del motor de inferencia numallama, desarrollado por miloserdev. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos provienen del modelo abliterated de huihui-ai, y el trabajo de este repositorio consiste en su cuantización (Q4 y Q8) y empaquetado para un motor C orientado a servidores CPU con soporte NUMA.

El interés del artefacto es doble. Por un lado, ofrece una variante sin comportamiento de rechazo (abliterated) del Llama 3.2 de 3B parámetros, lo que permite analizar y utilizar el modelo en escenarios donde las negativas del modelo original resultan un obstáculo. Por otro, demuestra un pipeline de inferencia puramente CPU con ejecución consciente de NUMA a través de todos los sockets de máquinas multisocket, algo poco habitual en el ecosistema, dominado por GPUs y por llama.cpp.

Es relevante para quienes despliegan modelos pequeños en infraestructura ARM64 de servidor (Ampere Altra, AWS Graviton, Neoverse) sin GPU, y para investigadores interesados en las técnicas de abliteration y en motores de inferencia alternativos. El repositorio no incluye pesos en safetensors ni GGUF: solo binarios `.bin` específicos de numallama, lo que limita su portabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), pesos convertidos a formato numallama |
| Parametros totales | 3B (heredados de Llama-3.2-3B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.2 3B soporta 128K, pero la card no lo confirma para este binario) |
| Tipos de cuantizacion | Q4 asimetrica (grupos de 32, escala y minimo en fp16, con importance matrix) y Q8 int8 con escalas por grupo |
| Idiomas soportados | no disponible (la importance matrix se recogio sobre ingles, ruso, chino y codigo) |
| Licencia | Llama 3.2 Community License (con Acceptable Use Policy) |
| Formato de pesos | `.bin` propietario de numallama (no GGUF, no safetensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B Instruct de Meta: un transformer decoder-only con atención por grupos (GQA), entrenado originalmente por Meta y posteriormente modificado por huihui-ai mediante abliteration, una técnica que identifica y elimina la dirección latente asociada al comportamiento de rechazo, de modo que el modelo deja de negarse a responder ciertas peticiones. Sobre ese modelo, miloserdev aplica una cuantización Q4 asimétrica (grupos de 32 elementos, escala y mínimo en fp16) calibrada con una importance matrix recogida por numallama sobre texto en inglés, ruso, chino y código, y una cuantización Q8 int8 con escalas por grupo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO específicas para esta conversión; esos datos pertenecen al modelo original de Meta y no se detallan en la card. La innovación técnica destacable no está en el modelo sino en el motor: numallama es un motor de inferencia en C para servidores CPU con ejecución NUMA-aware repartida entre todos los sockets de una máquina multisocket, con kernels NEON optimizados para ARM64 y código C portable (no optimizado) para otras arquitecturas, incluido x86-64. El motor soporta además decodificación especulativa y una API compatible con OpenAI.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Llama 3.2 3B Instruct.
- Razonamiento básico, matemáticas elementales y generación de código, limitados por el tamaño de 3B parámetros.
- Comportamiento abliterated: no aplica el rechazo del modelo original ante peticiones que este rechazaría.
- Soporte de tool calling y function calling a través del motor numallama (el README del motor menciona opciones de tools).
- Decodificación especulativa soportada por el motor.
- Servidor compatible con la API de OpenAI en `/v1`, lo que permite integrarlo con clientes existentes.
- Capacidades multilingües: no confirmadas explícitamente; la calibración de cuantización incluyó inglés, ruso, chino y código.
- Sin visión, audio ni modo thinking: no se mencionan en la información disponible.

## Casos de uso

- Despliegue en servidores ARM64 sin GPU: el modelo está optimizado para Ampere Altra, AWS Graviton y otros núcleos Neoverse con kernels NEON, lo que permite servir un chatbot de 3B en infraestructura CPU de bajo coste.
- Aprovechamiento de máquinas multisocket: la ejecución NUMA-aware reparte la inferencia entre todos los sockets, útil en servidores de 128 o 256 núcleos que de otro modo desperdiciarían recursos.
- Sustitución de endpoints OpenAI en prototipos: el servidor compatible con `/v1` permite apuntar clientes existentes al binario local sin cambios de código.
- Investigación sobre abliteration: permite estudiar empíricamente cómo cambia el comportamiento del modelo al eliminar la dirección de rechazo, comparándolo con el modelo original de Meta.
- Evaluación de motores de inferencia alternativos: sirve como banco de pruebas para comparar numallama con llama.cpp u Ollama en términos de latencia y throughput en CPU.
- Generación de texto y código en entornos aislados: al ser un binario C con pesos locales, puede ejecutarse en máquinas sin acceso a servicios en la nube, útil para laboratorios con requisitos de confidencialidad.
- Experimentación con cuantización Q4 frente a Q8: los dos binarios permiten medir el compromiso entre calidad y velocidad (104 tok/s frente a 81 tok/s en el hardware de referencia).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La card solo aporta datos de velocidad de decodificación medidos en 2 × Ampere Altra Max M128-30 (256 núcleos Neoverse N1), ambos sockets:

| Binario | Pesos | Tamano | Velocidad de decodificacion |
|---|---|---:|---:|
| `llama-3.2-3b-instruct-abliterated-q4.bin` | Q4 | 2.2 GB | 104 tok/s |
| `llama-3.2-3b-instruct-abliterated-q8.bin` | Q8 | 3.4 GB | 81 tok/s |
| `tokenizer.bin` | tokenizer | 1.9 MB | — |

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU. RAM necesaria: aproximadamente 2.2 GB para Q4 y 3.4 GB para Q8, más el overhead del motor y del tokenizador.
- GPU recomendadas: ninguna; el motor es exclusivamente CPU.
- Cabe en cualquier equipo con suficiente RAM, pero el rendimiento óptimo requiere ARM64 con NEON (Ampere Altra, AWS Graviton, Neoverse). En x86-64 el código es C portable no optimizado.
- Sistemas operativos: Linux.
- Opciones de despliegue: únicamente numallama (compilado con `make`); no funciona con llama.cpp, Ollama, LM Studio ni transformers.
- Latencia y throughput: 104 tok/s (Q4) y 81 tok/s (Q8) en 2 × Ampere Altra Max M128-30 con 256 núcleos; otras máquinas diferirán.
- El motor soporta modo chat en terminal y servidor HTTP compatible con OpenAI en el puerto indicado (`-P 8080`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---:|---|---|---|
| Llama-3.2-3B-Instruct-abliterated-numallama | 3B | no disponible | `.bin` numallama | Llama 3.2 Community | Solo CPU, NUMA-aware, abliterated |
| huihui-ai/Llama-3.2-3B-Instruct-abliterated | 3B | 128K (modelo base) | safetensors | Llama 3.2 Community | Modelo origen, requiere GPU o transformers |
| meta-llama/Llama-3.2-3B-Instruct | 3B | 128K | safetensors | Llama 3.2 Community | Modelo original con rechazo |
| miloserdev/Llama-3.2-3B-Instruct-numallama | 3B | no disponible | `.bin` numallama | Llama 3.2 Community | Misma conversión sin abliteration |

## Limitaciones y advertencias

- Modelo abliterated: elimina el comportamiento de rechazo del original y responderá a peticiones que el modelo de Meta rechazaría. El usuario es responsable del uso y debe cumplir la Llama 3.2 Community License y su Acceptable Use Policy.
- Formato propietario: los `.bin` solo funcionan con numallama; no son compatibles con llama.cpp, Ollama, LM Studio ni transformers, lo que limita la portabilidad y el ecosistema de herramientas.
- Rendimiento dependiente de arquitectura: en x86-64 el código es portable y no está optimizado; el rendimiento medido solo aplica a ARM64 Neoverse.
- Riesgo de alucinación inherente a un modelo de 3B parámetros, especialmente en razonamiento complejo, matemáticas y código.
- Sesgos: no se documentan sesgos específicos en la información disponible; se heredan los del modelo base de Meta.
- Idiomas: no se confirma la lista de idiomas soportados; la calibración de cuantización cubrió inglés, ruso, chino y código, pero no garantiza calidad en otros idiomas.
- Contexto: la card no especifica la longitud de contexto configurada en los binarios; no debe asumirse el contexto completo del modelo base.
- Licencia Llama 3.2: restricciones de uso comercial y obligaciones de atribución según los términos de Meta.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/miloserdev/Llama-3.2-3B-Instruct-abliterated-numallama
- Motor numallama: https://github.com/miloserdev/numallama
- README de numallama: https://github.com/miloserdev/numallama#readme
- Modelo base abliterated: https://huggingface.co/huihui-ai/Llama-3.2-3B-Instruct-abliterated
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Variante sin abliteration: https://huggingface.co/miloserdev/Llama-3.2-3B-Instruct-numallama
