# kantundpeterpan/Ternary-Bonsai-2-27B-gguf

# Ternary-Bonsai-2-27B-gguf

## Resumen

Ternary-Bonsai-2-27B-gguf es un espejo (mirror) "slim" del modelo prism-ml/Ternary-Bonsai-2-27B-gguf, publicado por el usuario kantundpeterpan. Se trata de una variante cuantizada a ternario (empaquetado de 2 bits) de un modelo de aproximadamente 26,9 mil millones de parametros, distribuida en formato GGUF junto con un proyector visual (mmproj) que indica capacidad multimodal de vision. El repositorio se ha recortado para incluir unicamente los ficheros necesarios para el despliegue en HF Inference Endpoints.

El modelo original pertenece a Prism ML y se distribuye bajo licencia Apache-2.0, aunque el repositorio de HuggingFace consultado no declara licencia ni idiomas en sus metadatos. El espejo no esta afiliado ni respaldado por Prism ML y mantiene los pesos sin modificar respecto al modelo original.

Su relevancia practica radica en la cuantizacion ternaria de 2 bits: reduce un modelo de ~27B a un fichero GGUF de aproximadamente 7,8 GB, lo que facilita su ejecucion en hardware de consumo y su despliegue en entornos donde el espacio o la VRAM son limitados. La informacion publica disponible es escasa: no se detallan arquitectura, contexto, datos de entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer multimodal, no confirmado en la informacion) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria de 2 bits (empaquetado PQ2_0 en GGUF); proyector visual en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (segun la model card, (c) Prism ML); el repositorio de HuggingFace no la declara |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion (RLHF, DPO u otras). La model card del espejo se limita a indicar que replica los pesos del modelo upstream sin modificarlos y que incluye un proyector visual (mmproj-BF16), lo que sugiere una arquitectura multimodal con soporte de vision, pero este extremo no se confirma explicitamente.

La innovacion tecnica destacable es la cuantizacion ternaria de 2 bits (empaquetado PQ2_0), que comprime los pesos del modelo hasta un fichero de ~7,8 GB. El modelo se sirve mediante un fork especifico de llama.cpp mantenido por Prism ML, necesario para interpretar este formato de cuantizacion no estandar en las builds habituales de llama.cpp.

## Capacidades

- Generacion de texto conversacional (el repositorio se etiqueta como "conversational").
- Capacidad multimodal de vision, inferida por la presencia del fichero Ternary-Bonsai-2-27B-mmproj-BF16.gguf (proyector visual).
- Compatible con despliegue en HF Inference Endpoints (etiqueta "endpoints_compatible").
- Razonamiento, codigo, matematicas, tool calling, agentes y multilingue: no disponible (sin datos publicados).

## Casos de uso

- Despliegue en entornos con VRAM limitada: gracias a su cuantizacion ternaria de 2 bits y un fichero de ~7,8 GB, puede ejecutarse en GPUs de consumo donde un modelo de 27B en precision completa no cabria.
- Inferencia en el borde o en servidores modestos: el reducido tamano del GGUF permite servir el modelo en instancias con poca memoria, aunque con la penalizacion de calidad propia de una cuantizacion tan agresiva.
- Asistentes conversacionales de proposito general: la etiqueta "conversational" indica que esta orientado a dialogos multi-turno, aunque se desconoce la longitud de contexto soportada.
- Tareas de vision-lenguaje: la inclusion del proyector visual permite, en principio, procesar imagenes junto a texto, si bien no hay documentacion disponible sobre su rendimiento.
- Prototipado e investigacion sobre cuantizacion ternaria: util como referencia para estudiar el impacto de la cuantizacion a 2 bits en modelos de ~27B.
- Experimentacion en pipelines de HF Inference Endpoints: al estar marcado como compatible, puede desplegarse directamente en esa plataforma usando el fork de llama.cpp indicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir del tamano del fichero (~7,8 GB), los pesos ternarios de 2 bits ocuparian del orden de 8 GB de VRAM, a los que habria que sumar la cache KV (no disponible su tamano). Cabe holgadamente en GPUs de 12-16 GB en adelante.
- GPU recomendadas: no confirmadas por el autor; por el tamano del modelo, serian viables tarjetas de consumo como RTX 3090, RTX 4090 (24 GB) o RTX 4080 (16 GB), ademas de GPUs profesionales (A100, H100) para mayor margen.
- Cabe en GPU de consumo: si, previsiblemente en modelos con 12-16 GB o mas de VRAM, dado el tamano del GGUF.
- Opciones de despliegue: llama.cpp mediante el fork de Prism ML (imagen ghcr.io/kantundpeterpan/llama-prism-bonsai2:prism-b10743-adfffbe) y HF Inference Endpoints. Compatibilidad con vLLM, Ollama o TGI: no disponible (el formato ternario PQ2_0 requiere el fork especifico).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B-gguf (este espejo) | ~26,9 mil millones | no disponible | Ternaria 2 bits (PQ2_0) | Apache-2.0 (segun model card) | GGUF, via fork de llama.cpp |
| prism-ml/Ternary-Bonsai-2-27B-gguf (upstream) | ~26,9 mil millones | no disponible | Original (formato base no disponible) | Apache-2.0 | Repositorio upstream en HuggingFace |

No se dispone de datos sobre modelos alternativos comparables (parametros, contexto, rendimiento, licencia y disponibilidad) en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion ternaria de 2 bits es extremadamente agresiva y previsiblemente degrada la calidad y coherencia de las respuestas respecto al modelo original en mayor medida que cuantizaciones de 4 u 8 bits.
- Riesgo de alucinacion: no evaluado; sin benchmarks ni documentacion sobre fidelidad factica.
- Idiomas soportados: no disponibles; no se puede garantizar un buen rendimiento en castellano ni en otros idiomas.
- Longitud de contexto: no disponible, lo que impide planificar tareas que requieran ventanas largas.
- Requiere un fork especifico de llama.cpp para funcionar; no es compatible con builds estandar, lo que complica el soporte y las actualizaciones.
- Es un espejo no oficial: no esta afiliado ni respaldado por Prism ML, y el repositorio de HuggingFace no declara licencia ni idiomas en sus metadatos, aunque la model card indica Apache-2.0.
- Uso comercial: la licencia Apache-2.0 permitiria uso comercial, pero al ser un espejo conviene verificar los terminos del modelo upstream original antes de explotarlo en produccion.
- Sin descargas ni likes registrados en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio del espejo: https://huggingface.co/kantundpeterpan/Ternary-Bonsai-2-27B-gguf
- Modelo upstream: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Fork de llama.cpp (release pineada): https://github.com/PrismML-Eng/llama.cpp/releases/tag/prism-b10743-adfffbe
- Imagen de contenedor: ghcr.io/kantundpeterpan/llama-prism-bonsai2:prism-b10743-adfffbe
