# Goddard/pie4k-rmbg-2.0-gguf

## Resumen

`Goddard/pie4k-rmbg-2.0-gguf` es una conversion a formato GGUF del modelo BRIA RMBG-2.0, una red BiRefNet disenada para la eliminacion de fondos en imagenes (background removal). El autor, Goddard, publica unicamente el artefacto convertido: un fichero F16 de 440.372.928 bytes (aproximadamente 0,44 GB) que sigue el layout `birefnet` de vision.cpp, con disposicion WHCN por defecto y entrada fija de 1024x1024 pixeles. No se trata de un modelo de lenguaje ni de un modelo generativo de texto, sino de un segmentador de imagenes especializado.

El proposito de esta publicacion es practico y acotado: servir como dependencia binaria para el pipeline de eliminacion de fondos del proyecto PIE4K, concretamente el servicio `services/DiffusionService/BackgroundRemoval.cpp`, que carga el fichero mediante el loader BiRefNet de ggml integrado en trellis2.c. El modelo se coloca en la ruta `<models>/rmbg-2.0/rmbg-2.0-F16.gguf`, resuelta a partir de `$PIE4K_HOME/models` o `~/.local/share/pie4k/models`.

La relevancia de esta ficha es doble: por un lado, documenta un artefacto de infraestructura para quien despliegue PIE4K; por otro, aclara una confusion frecuente, ya que el identificador del autor ("Goddard") no guarda relacion con el modelo base ni con ningun modelo de lenguaje. El modelo subyacente, RMBG-2.0 de BRIA AI, cuenta con 220.162.278 parametros segun los safetensors originales y se distribuye bajo una licencia restrictiva para uso no comercial (CC BY-NC 4.0), lo que condiciona cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet (red de segmentacion binaria de imagen, base `briaai/RMBG-2.0`) |
| Parametros totales | 220.162.278 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 1024x1024) |
| Tipos de cuantizacion | F16 (unico fichero publicado) |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | `bria-rmbg-2.0` (CC BY-NC 4.0, solo uso no comercial) |
| Formato de pesos | GGUF (layout `birefnet` de vision.cpp, disposicion WHCN, F16) |

## Arquitectura y entrenamiento

El modelo base es BiRefNet, una arquitectura de segmentacion de imagen de tipo encoder-decoder con supervision multiple y agregacion multi-escala, orientada a la extraccion de mascaras binarias de alta calidad (recorte de sujeto frente a fondo). El artefacto GGUF conserva la topologia original, pero reorganiza los tensores al layout `birefnet` definido por vision.cpp, con disposicion WHCN y una resolucion de entrada fija de 1024x1024 pixeles. Los pesos se almacenan en F16, sin cuantizacion adicional.

La conversion se realizo con el script `scripts/convert.py` de vision.cpp en el commit `26a752912d49f6c4ff4545b35a1bdf7400d349ed`, invocado a traves de `tools/rmbg/convert_rmbg.sh` del repositorio PIE4K, que descarga `model.safetensors` y `config.json` de la revision `2fd7b4b0f2393ddb39a267fb62df6c010928a6c6` de `briaai/RMBG-2.0` mediante la CLI de Hugging Face. El comando exacto es `uv run --script scripts/convert.py birefnet rmbg-2.0.safetensors --quantize f16 --output rmbg-2.0-F16.gguf`. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens o imagenes vistas, ni sobre el uso de RLHF, DPO u otras tecnicas de alineacion en la informacion proporcionada.

## Capacidades

- Eliminacion de fondos en imagenes: genera una mascara binaria que separa el sujeto del fondo a partir de una imagen de entrada de 1024x1024 pixeles.
- Segmentacion de imagen de proposito general: la arquitectura BiRefNet esta disenada para recorte de sujetos, productos, retratos y objetos.
- Inferencia local en CPU o GPU mediante ggml/vision.cpp, sin dependencias de frameworks de deep learning pesados.
- Integracion directa con el pipeline de PIE4K a traves del loader BiRefNet de ggml.
- No soporta generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni capacidades multilingues: es exclusivamente un modelo de vision para segmentacion.
- No dispone de modo thinking, vision multimodal ni procesamiento de audio.

## Casos de uso

- Eliminacion de fondos en el pipeline PIE4K: el caso de uso principal y documentado. El fichero se coloca en `<models>/rmbg-2.0/rmbg-2.0-F16.gguf` y `BackgroundRemoval.cpp` lo carga con el loader BiRefNet de ggml para generar mascaras antes de etapas de difusion.
- Preprocesado de imagenes para generacion 3D: en flujos tipo trellis2.c, la mascara de recorte aisla el objeto de interes y mejora la calidad de la reconstruccion al eliminar el fondo del plano de entrada.
- Recorte automatico de productos en catalogos de e-commerce: el modelo genera mascaras de sujeto sobre fondo uniforme o complejo, aptas para fichas de producto con fondo transparente.
- Preparacion de datasets de vision: generacion masiva de mascaras binarias para entrenar o evaluar otros segmentadores o modelos de difusion condicionados por mascara.
- Edicion fotografica por lotes en local: su formato GGUF y su ejecucion via ggml permiten procesar carpetas de imagenes en equipos sin GPU dedicada, integrado en scripts de escritorio.
- Prototipado de herramientas de recorte en aplicaciones de escritorio: al no requerir PyTorch ni CUDA, el binario resultante es facil de empaquetar en aplicaciones nativas o de linea de comandos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero F16 ocupa 440.372.928 bytes (0,44 GB); con activaciones a 1024x1024 la huella en memoria es moderada, aunque no se dispone de cifras exactas de pico publicadas.
- GPU recomendadas: no disponible en la informacion proporcionada; al ejecutarse sobre ggml, es compatible con backends CPU y GPU soportados por vision.cpp.
- Compatibilidad con GPU de consumo: el tamano del fichero (0,44 GB) sugiere que cabe holgadamente en cualquier GPU de consumo moderna, si bien no se confirma en la documentacion.
- Opciones de despliegue: loader BiRefNet de vision.cpp sobre ggml, integrado en trellis2.c y en el servicio `BackgroundRemoval.cpp` de PIE4K.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Goddard/pie4k-rmbg-2.0-gguf | 220.162.278 | 1024x1024 | GGUF F16 | bria-rmbg-2.0 (CC BY-NC 4.0) | Hugging Face |
| briaai/RMBG-2.0 | 220.162.278 | 1024x1024 | safetensors | bria-rmbg-2.0 (CC BY-NC 4.0) | Hugging Face |
| briaai/RMBG-1.4 | no disponible | no disponible | safetensors | bria-rmbg-1.4 | Hugging Face |

La comparativa se limita al modelo base y a la version anterior de la familia, ya que la informacion disponible no incluye otros segmentadores comparables con datos verificables. La diferencia practica entre este artefacto y `briaai/RMBG-2.0` es exclusivamente el formato: GGUF F16 para vision.cpp frente a safetensors para PyTorch.

## Limitaciones y advertencias

- Licencia restrictiva: CC BY-NC 4.0, solo uso no comercial. Cualquier despliegue en produccion comercial requiere una licencia aparte de BRIA AI.
- Modelo de vision sin capacidades de lenguaje: no debe evaluarse con criterios de LLM (contexto, benchmarks de texto, tool calling).
- Entrada fija de 1024x1024: las imagenes de otras resoluciones deben redimensionarse, lo que puede degradar la calidad de la mascara en objetos muy pequenos o muy alargados.
- Riesgo de mascaras imprecisas en sujetos con bordes ambiguos, pelo fino, transparencias o fondos con color similar al sujeto.
- Sin datos publicados de sesgos: no se dispone de evaluaciones de sesgo por tipo de sujeto, demografia o dominio.
- Unico fichero publicado (F16): no hay variantes cuantizadas a Q8, Q4 u otras, lo que limita el ajuste fino de memoria y velocidad.
- Artefacto de infraestructura: la documentacion esta orientada al proyecto PIE4K; no se detallan metricas de calidad ni comparaciones con otros segmentadores.
- El autor del repositorio ("Goddard") no es el desarrollador del modelo base; la autoria del modelo corresponde a BRIA AI.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Goddard/pie4k-rmbg-2.0-gguf
- Modelo base: https://huggingface.co/briaai/RMBG-2.0
- vision.cpp (Acly): https://github.com/Acly/vision.cpp
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/deed.en
