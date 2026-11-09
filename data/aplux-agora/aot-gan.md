# APLUX-Agora/AOT-GAN

## Resumen

AOT-GAN es un modelo de image-to-image orientado a la reconstruccion de imagenes (inpainting): recibe una imagen original y una mascara binaria en blanco y negro, y rellena las regiones blancas de la mascara conservando intactos los pixeles fuera de ella. Lo publica APLUX-Agora dentro de su iniciativa Model Farm, cuyo objetivo es distribuir recursos ya convertidos y listos para ejecutarse en hardware Qualcomm de borde (QNN), en lugar de pesos genericos pensados para GPU de escritorio.

La relevancia del repositorio no esta en el modelo en si, sino en el empaquetado: cada SoC soportado (QCS6490 y QCS8550) dispone de su propio directorio `targets/<SoC>/` con `model.json` y binarios de contexto `model.bin` por precision (FP16, W8A16, W8A8). Esto permite desplegar inpainting en placas AIoT reales con latencias medidas de 123,1 ms en QCS8550 y 140,3 ms en QCS6490 con la precision por defecto.

El repositorio es muy pequeno (0,1 GB) y no incluye informacion sobre la arquitectura interna, el dataset de entrenamiento ni el numero de parametros. La model card remite a los terminos del modelo original para la licencia del modelo fuente y aplica la licencia APLUX Model Farm a los recursos convertidos. No consta actividad de la comunidad (0 descargas, 0 likes) en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere GAN con atencion, sin confirmar en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no aplica (modelo de vision image-to-image) |
| Tipos de cuantizacion | FP16, W8A16, W8A8 (segun SoC) |
| Idiomas soportados | no disponible (modelo de imagen, sin interfaz de texto) |
| Licencia | APLUX Model Farm License para los recursos convertidos; terminos del modelo original para el modelo fuente |
| Formato de pesos | binarios de contexto QNN (`model.bin`) y `model.json` por SoC; no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el numero de parametros, los datos de entrenamiento ni el proceso de optimizacion (RLHF, DPO u otros). La model card unicamente describe la tarea: entrada de imagen y mascara, salida de imagen con las regiones en blanco de la mascara reconstruidas y los pixeles externos preservados.

El elemento tecnico diferencial es la conversion a QNN para Qualcomm: los recursos se organizan por SoC (`targets/QCS6490/`, `targets/QCS8550/`), con un `model.json` que declara la precision por defecto y las rutas de cada variante, y binarios de contexto por precision. Se incluyen `NOTICE.md` y `SHA256SUMS` para verificar procedencia e integridad. El flujo de despliegue se completa con preprocesado, postprocesado y runner exportables desde la plataforma Agora.

## Capacidades

- Inpainting / reconstruccion de imagenes: rellena las zonas marcadas en blanco de la mascara y conserva el resto de pixeles sin modificar.
- Entrada multimodal de imagen y mascara binaria; salida de imagen.
- Ejecucion en hardware Qualcomm de borde mediante QNN, con variantes de precision FP16, W8A16 y W8A8.
- Despliegue reproducible por SoC mediante descarga selectiva de `targets/<SoC>/*`.
- Verificacion de integridad de los recursos mediante SHA256SUMS.
- No consta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades de texto o audio.

## Casos de uso

- Restauracion de fotografias en dispositivos de borde: eliminacion de objetos no deseados o reparacion de zonas danadas en camaras y moviles con SoC Qualcomm, usando la variante W8A8 para minimizar memoria.
- Vision artificial industrial en linea de produccion: reparacion o normalizacion de regiones defectuosas en imagenes de inspeccion capturadas por camaras conectadas a placas QCS6490 o QCS8550, con latencias de 123-140 ms por imagen.
- Preprocesado en pipelines de vision para AIoT: relleno de oclusiones o huecos en fotogramas antes de pasarlos a un modelo de deteccion o segmentacion posterior.
- Retoque asistido en aplicaciones moviles: integracion del binario QNN en apps Android sobre hardware Qualcomm para eliminar marcas de agua, logos o elementos temporales indicados por el usuario mediante mascara.
- Limpieza de datasets de imagen: reconstruccion automatizada de regiones corruptas u ocultas en lotes de imagenes antes de reutilizarlas en entrenamiento.
- Demostraciones y evaluacion sin hardware: uso del entorno online de Agora (mega.aidlux.com/models/aot-gan) para validar la calidad del inpainting antes de adquirir una placa.

## Benchmarks y rendimiento

La unica metrica publicada es la latencia medida en Agora con la precision por defecto:

| SoC · placa | Precisiones disponibles | Latencia medida (precision por defecto) |
|---|---|---|
| QCS6490 · Rhino Pi A1 | W8A16, W8A8 | 140,3 ms |
| QCS8550 · Rhino Pi X1 | FP16, W8A16, W8A8 | 123,1 ms |

No se han publicado resultados de benchmarks de calidad de imagen (PSNR, SSIM, FID u otros) en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: SoCs Qualcomm QCS6490 y QCS8550, sobre placas Rhino Pi A1 y Rhino Pi X1 respectivamente.
- No se documenta soporte para GPU de escritorio (A100, H100, RTX 4090) ni requisitos de VRAM; el formato publicado es QNN, no safetensors ni GGUF.
- Despliegue mediante el runner de Agora y los binarios de contexto QNN incluidos en `targets/<SoC>/`.
- No consta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia de referencia: 123,1 ms (QCS8550) y 140,3 ms (QCS6490) por inferencia con la precision por defecto.
- Throughput no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos que permitan establecer una comparacion fiable en parametros, contexto o calidad de inpainting.

## Limitaciones y advertencias

- Ausencia total de especificaciones del modelo fuente: se desconoce el numero de parametros, la arquitectura exacta y el dataset de entrenamiento, lo que impide evaluar su calidad frente a alternativas.
- Solo funciona en hardware Qualcomm soportado (QCS6490 y QCS8550); no se ofrecen pesos en formatos estandar para otros aceleradores.
- La licencia APLUX Model Farm aplica a los recursos convertidos, mientras que el modelo fuente se rige por sus propios terminos; es necesario revisar ambos antes de un uso comercial.
- Riesgo de artefactos o alucinacion visual en las regiones reconstruidas, inherente a los modelos generativos de imagen; no hay metricas publicadas que lo cuantifiquen.
- Sin informacion sobre sesgos: al ser un modelo de imagen, los sesgos dependerian del dataset de entrenamiento, que no se documenta.
- Repositorio sin actividad (0 descargas, 0 likes) y creado en noviembre de 2026, por lo que no existe validacion independiente de la comunidad.
- No apto para tareas de texto, razonamiento, codigo ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/APLUX-Agora/AOT-GAN
- Demo online en Agora: https://mega.aidlux.com/models/aot-gan
- Plataforma Agora: https://mega.aidlux.com
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/AOT-GAN/blob/main/LICENSE_MODEL_FARM.pdf
- Ficheros de procedencia e integridad: NOTICE.md y SHA256SUMS en el repositorio
