# adolan/LFM3-1.7B-abliterated-GGUF

## Resumen

LFM3-1.7B-abliterated-GGUF es una distribucion en formato GGUF del modelo LFM3-1.7B-abliterated publicado por OrcaRouter, que a su vez deriva del LFM3-1.7B original de Liquid AI. El repositorio lo mantiene el usuario adolan y su unico valor anadido es la conversion de pesos safetensors a GGUF y la generacion de cuantizaciones estandar de llama.cpp (BF16, Q8_0 y Q4_K_M). No se ha reentrenado ni modificado ningun tensor respecto al modelo base.

El modelo subyacente es un transformer de 1.728.801.600 parametros (aproximadamente 1,7B) con una longitud de contexto declarada de 262.144 tokens, pensado para generacion de texto conversacional y soporte de tool calling a traves de su plantilla de chat. La variante "abliterated" implica que se han eliminado o atenuado direcciones de rechazo en el espacio de activaciones, lo que reduce las negativas del modelo ante peticiones sensibles, un cambio que afecta directamente a su comportamiento en produccion y a las consideraciones de seguridad.

Su relevancia practica es doble: por un lado, ofrece un modelo pequeno y multilingue (17 idiomas) en un formato directamente ejecutable con llama.cpp, lo que permite desplegarlo en hardware de consumo; por otro, documenta de forma transparente la cadena de procedencia (Liquid AI, OrcaRouter, llama.cpp) y advierte de que las cuantizaciones no son las QAD oficiales de Liquid AI. La licencia es LFM Open License v1.0, que conviene revisar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles de atencion y capas no disponibles en la informacion proporcionada) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 262.144 tokens (entrenado); la ejecucion practica depende de la VRAM |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M (cuantizaciones estandar de llama.cpp) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (17 idiomas) |
| Licencia | LFM Open License v1.0 (license_name: lfm1.0) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del LFM3-1.7B original (numero de capas, tipo de atencion, uso de atencion lineal o hibrida, etc.); solo se confirma que es un transformer de 1,7B parametros con contexto de 262.144 tokens. Tampoco se especifican el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. La model card del repositorio GGUF se limita a describir el proceso de conversion y no aporta datos de entrenamiento.

Lo que si esta documentado es la cadena de transformaciones: Liquid AI entreno el LFM3-1.7B; OrcaRouter publico los pesos "abliterated" (una modificacion post-entrenamiento que elimina direcciones de rechazo en las activaciones, sin reentrenar); y adolan convirtio esos safetensors a GGUF BF16 con llama.cpp b12040 (commit 00ef13664) y genero Q8_0 y Q4_K_M a partir de ese BF16. La plantilla de chat original, incluido el soporte de tool calls, se conserva dentro del GGUF. Se requiere llama.cpp b11960 (v0.8.0) o superior para cargar el modelo.

## Capacidades

- Generacion de texto conversacional multi-turno en 17 idiomas, incluidos espanol, ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, vietnamita, tailandes, indonesio, hindi, ruso y polaco.
- Soporte de tool calling / function calling mediante la plantilla de chat Jinja incluida en el GGUF (se activa con `--jinja` en llama.cpp).
- Razonamiento multi-paso y uso como agente conversacional, segun la orientacion del modelo base.
- Ejecucion local en CPU y GPU a traves de llama.cpp y ecosistemas compatibles con GGUF.
- Capacidad de contexto largo (hasta 262.144 tokens en teoria), sujeta a la memoria disponible.
- Comportamiento "abliterated": menor probabilidad de rechazo ante peticiones que el modelo original rechazaria.
- No se documentan capacidades de vision, audio ni modo "thinking" explicito en la informacion disponible.

## Casos de uso

- Asistente conversacional local en espanol: el modelo puede mantener dialogos multi-turno en castellano sin conexion a Internet, lo que resulta adecuado para aplicaciones de escritorio o entornos con requisitos de privacidad.
- Generacion de codigo asistida en local: con tool calling y una ventana de contexto amplia, puede integrarse en editores o scripts que necesiten invocar funciones externas (ejecutar tests, consultar documentacion) sin depender de una API en la nube.
- Procesamiento de documentos largos: los 262.144 tokens de contexto permiten resumir o extraer informacion de contratos, informes o transcripciones extensas, siempre que la VRAM permita cargar el contexto completo.
- Traduccion y atencion multilingue: al cubrir 17 idiomas, sirve para prototipos de traduccion o de soporte al cliente en mercados con varios idiomas, ejecutandose en una sola GPU de consumo.
- Clasificacion y extraccion de entidades en pipelines de datos: su tamano reducido permite procesar lotes grandes en CPU o GPU modesta, con throughput alto por el bajo coste por token.
- Experimentacion en investigacion sobre alineacion y seguridad: la variante abliterated es util para estudiar como cambia el comportamiento de un modelo al eliminar direcciones de rechazo, comparandolo con el LFM3-1.7B original.
- Despliegue en dispositivos con recursos limitados: la cuantizacion Q4_K_M reduce el modelo a unos pocos GB, lo que permite ejecutarlo en portatiles o mini-PC sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB para BF16 (1,7B parametros x 2 bytes), en torno a 1,8-2 GB para Q8_0 y aproximadamente 1,1-1,3 GB para Q4_K_M, sin contar la cache KV.
- Cache KV: con contexto largo el consumo crece de forma significativa; usar los 262.144 tokens completos exige mucha mas memoria que el peso del modelo. La model card recomienda ajustar `-c` a lo que quepa en la GPU.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para contextos muy largos o alto throughput. Cualquier GPU con 4-8 GB puede ejecutar Q4_K_M con contexto moderado.
- Cabe en GPU de consumo: si, practicamente cualquier GPU con 4 GB o mas para Q4_K_M; para contextos de decenas de miles de tokens conviene 12-16 GB.
- Tambien puede ejecutarse en CPU con llama.cpp, aunque con menor throughput.
- Opciones de despliegue: llama.cpp (version b11960 / v0.8.0 o superior), y por compatibilidad de formato, herramientas basadas en GGUF como Ollama o servidores compatibles con llama.cpp. No se confirma soporte de vLLM o TGI en la informacion disponible.
- Parametros de muestreo sugeridos por el autor del modelo base: `--temp 0.1 --top-k 50 --repeat-penalty 1.1`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| adolan/LFM3-1.7B-abliterated-GGUF | 1,7B | 262.144 | LFM Open License v1.0 | GGUF (BF16, Q8_0, Q4_K_M) | Variante abliterated, conversion de llama.cpp |
| orcarouter/LFM3-1.7B-abliterated | 1,7B | 262.144 | LFM Open License v1.0 | safetensors | Pesos abliterated originales, sin cuantizar |
| LiquidAI/LFM3-1.7B | 1,7B | 262.144 | LFM Open License v1.0 | safetensors / GGUF oficial | Modelo original de Liquid AI, con cuantizacion QAD Q4_0 oficial |
| LiquidAI/LFM3-1.7B-GGUF | 1,7B | 262.144 | LFM Open License v1.0 | GGUF | Distribucion oficial en GGUF; incluye QAD Q4_0 |

La diferencia clave frente a las alternativas oficiales es el comportamiento abliterated y el uso de cuantizaciones estandar de llama.cpp en lugar de las QAD de Liquid AI. En rendimiento medido no hay datos comparativos disponibles.

## Limitaciones y advertencias

- La variante abliterated elimina direcciones de rechazo, lo que aumenta el riesgo de generar contenido danino, ofensivo o inapropiado; no es recomendable para aplicaciones orientadas al publico sin filtros adicionales.
- Riesgo de alucinacion inherente a un modelo de 1,7B: la capacidad de razonamiento y de verificacion factica es limitada en comparacion con modelos mucho mayores.
- El contexto de 262.144 tokens es teorico; en la practica la ventana util se reduce por memoria y por la degradacion de atencion en contextos muy largos.
- El rendimiento multilingue puede variar mucho entre idiomas; no se han publicado evaluaciones por idioma.
- La licencia LFM Open License v1.0 impone condiciones especificas para uso comercial; es obligatorio revisar el archivo LICENSE antes de desplegar el modelo en produccion.
- Las cuantizaciones Q8_0 y Q4_K_M no son las QAD oficiales de Liquid AI; pueden presentar diferencias de calidad frente a las versiones oficiales.
- Requiere llama.cpp b11960 (v0.8.0) o superior; versiones anteriores no cargaran el modelo correctamente.
- El repositorio tiene muy poca traccion (811 descargas, 3 likes en el momento de la consulta) y no procede de un canal oficial, por lo que la trazabilidad y el soporte son limitados.
- No hay datos publicados de benchmarks que permitan validar la calidad del modelo en tareas concretas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/adolan/LFM3-1.7B-abliterated-GGUF
- Modelo base abliterated: https://huggingface.co/orcarouter/LFM3-1.7B-abliterated
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B
- GGUF oficial de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/lfm3-1-7b.html
- Ficha en free2aitools: https://free2aitools.com/model/adolan/lfm3-1.7b-abliterated-gguf
