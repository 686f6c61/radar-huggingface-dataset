# fernandotonon/QtMeshEditor-lama-onnx

## Resumen

QtMeshEditor-lama-onnx es un reempaquetado en formato ONNX del modelo LaMa (Large Mask Inpainting), publicado por el usuario fernandotonon para que la aplicación de escritorio QtMeshEditor pueda descargarlo y ejecutarlo automáticamente. No es un modelo entrenado por el autor ni un modelo de lenguaje: es la exportación a ONNX de LaMa, la red de inpainting de imágenes presentada por Suvorov et al. en el artículo «Resolution-robust Large Mask Inpainting with Fourier Convolutions» (WACV 2022), cuyo grafo de origen es el repositorio Carve/LaMa-ONNX.

La aportación concreta de este repositorio es doble. Por un lado, actúa como espejo estable para el runtime de QtMeshEditor. Por otro, corrige un defecto del repositorio original: el archivo publicado allí como `lama.onnx` está roto y falla la inferencia de formas de ONNX Runtime en un nodo `DFT` (la convolución de Fourier de LaMa) con el error `one-sided DFT requires real input`; este repositorio aloja el grafo funcional `lama_fp32.onnx` bajo el nombre `lama.onnx`.

El modelo resuelve un problema muy acotado: rellenar regiones enmascaradas de una textura generando contenido plausible que continúe el patrón circundante, con especial foco en la reparación de costuras y sangrado de UV en mapas PBR. Trabaja con tensores fijos de 512x512 píxeles, máscara binaria y salida RGB ya escalada a 0..255. En la medición documentada por el autor alcanza un MAE de 9,15/255 (3,6%) dentro de la máscara y una fuga nula (MAE 0,0000) fuera de ella. El repositorio ocupa 0,2 GB, se distribuye bajo licencia Apache-2.0 y no registra descargas ni valoraciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional feed-forward con convoluciones de Fourier (FFC), según el artículo citado; grafo ONNX exportado |
| Parámetros totales | no disponible en la información proporcionada (el repositorio ocupa 0,2 GB, mayoritariamente pesos en fp32) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; modelo de visión con entrada espacial fija de 512x512 píxeles |
| Tipos de cuantización | no disponible; solo se publica el grafo en fp32 (`lama_fp32.onnx`) |
| Idiomas soportados | no aplica (modelo de imagen; no procesa texto) |
| Licencia | Apache-2.0 (código y pesos, según la model card) |
| Formato de pesos | ONNX (`lama_fp32.onnx`, renombrado a `lama.onnx`) |
| Pipeline declarado | image-to-image (inpainting) |
| Entrada 1 | `image`, float32, `[1,3,512,512]`, RGB escalado a [0,1] |
| Entrada 2 | `mask`, float32, `[1,1,512,512]`, 1 = inpaint, 0 = conservar |
| Salida | `output`, float32, `[1,3,512,512]`, RGB ya en 0..255 |
| Tamaño del repositorio | 0,2 GB |
| Librería | onnx |
| Autor | fernandotonon |
| Fecha de creación / actualización | 2026-09-15 / 2026-09-15 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es LaMa, una red de inpainting totalmente convolucional que sustituye parte de las convoluciones espaciales por convoluciones en el dominio de la frecuencia (Fast Fourier Convolution). Ese diseño es el que da al modelo su robustez a la resolución y su capacidad de propagar estructura global a través de máscaras grandes, algo que las convoluciones locales clásicas no consiguen con el mismo presupuesto de parámetros. El grafo exportado respeta ese diseño: el nodo `DFT` que provoca el fallo de shape inference en la exportación rota del repositorio original es precisamente el punto donde se materializa la convolución de Fourier.

La model card no documenta el conjunto de entrenamiento, el número de tokens o imágenes vistas, ni si hubo fases de ajuste fino con preferencias humanas; ese detalle debe consultarse en el artículo original (Suvorov et al., WACV 2022). Tampoco se documenta el proceso de exportación a ONNX más allá de la distinción entre `lama.onnx` (roto) y `lama_fp32.onnx` (funcional). No es un modelo de lenguaje, por lo que no hay RLHF ni DPO en el sentido habitual.

## Capacidades

- Inpainting de texturas: rellena regiones marcadas por una máscara binaria con contenido coherente con el entorno.
- Reparación de costuras y sangrado de UV: caso de uso principal documentado, orientado a mapas de textura de assets 3D.
- Procesado por teselas: al tener dimensiones espaciales fijas de 512x512, las texturas mayores se dividen en teselas solapadas de 512² con mezcla de costuras (feathered seam blend).
- Conservación exacta de lo no enmascarado: la medición reportada indica fuga nula (MAE 0,0000) en los píxeles fuera de la máscara.
- Ejecución sobre ONNX Runtime: el grafo es consumible desde cualquier runtime compatible con ONNX.
- Integración en CLI: `qtmesh material --texture albedo.png --inpaint --mask holes.png -o fixed.png`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto ni audio. No hay modo «thinking» ni capacidades multimodales distintas del par imagen-máscara.

## Casos de uso

- Reparación de costuras UV en texturas PBR: es el escenario para el que se creó el repositorio (issue #1017 de QtMeshEditor). Se marca la costura con una máscara fina y el modelo rellena la discontinuidad continuando el patrón del texel vecino.
- Eliminación de elementos no deseados en un atlas de texturas: se enmascara el logotipo, la marca de agua o el objeto que se quiere borrar y el modelo reconstruye el fondo subyacente antes de empaquetar el asset.
- Limpieza de texturas escaneadas o fotografiadas: sombras proyectadas, cables o reflejos parásitos se enmascaran y se sustituyen por material coherente con la superficie.
- Tratamiento homogéneo de un set completo de mapas PBR: aplicar la misma máscara sobre albedo, roughness, metallic y normal permite mantener la coherencia entre canales, siempre que la geometría de la máscara sea idéntica.
- Preparación de assets para render en tiempo real: reducir el sangrado de UV antes de comprimir la textura evita artefactos visibles en motores como Godot, Unity o Unreal.
- Prototipado en pipelines DCC: invocar el comando `qtmesh material` desde un script de build para reparar texturas de forma desatendida dentro de un proceso de exportación.
- Restauración de texturas antiguas o de baja calidad: rellenar zonas degradadas con contenido sintetizado, aceptando que el resultado es una reconstrucción plausible y no una recuperación fiel del original.

## Benchmarks y rendimiento

La model card solo publica dos mediciones internas del autor, y la búsqueda web realizada no devolvió resultados relevantes (los enlaces recuperados eran páginas genéricas de Zhihu sin relación con el modelo). No hay resultados de MMLU, HumanEval, GSM8K ni equivalentes porque no es un modelo de lenguaje.

| Prueba | Métrica | Resultado | Condiciones declaradas |
|---|---|---|---|
| Reconstrucción dentro de la máscara | MAE | 9,15/255 (3,6%) | Máscara de costura fina (caso de reparación de UV-bleed), comparada contra ground truth que el modelo no vio |
| Fuga fuera de la máscara | MAE | 0,0000 | Los píxeles no enmascarados se preservan exactamente |
| Comparación con otros modelos de inpainting | no disponible | no disponible | No se han publicado datos comparativos en la información disponible |

## Requisitos de hardware

- Peso en disco: 0,2 GB de repositorio, correspondiente en su mayor parte al grafo ONNX en fp32.
- VRAM estimada: por debajo de 2 GB incluyendo pesos, entradas y tensores intermedios a 512x512. Es una estimación a partir del tamaño del repositorio; el autor no publica cifras de memoria.
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime, incluidas GTX 1050/RTX 3050 y superiores. En el extremo alto, una A100 o H100 solo aportaría ganancia de latencia, no de capacidad, dado el tamaño del modelo.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo actual e incluso en GPUs integradas.
- CPU: la inferencia en CPU es viable para uso puntual o por lotes pequeños, dado el reducido tamaño del grafo.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), OpenCV DNN, TensorRT y DirectML, además de la integración nativa en QtMeshEditor, que descarga el archivo automáticamente en el primer uso. El repositorio agregado QtMeshEditor-models sirve la misma ruta `pbr/lama.onnx`.
- Advertencia de backend: los nodos `DFT` no están soportados por todos los runtimes de ONNX; conviene validar el grafo con el backend elegido antes de desplegarlo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Licencia | Estado del grafo | Notas |
|---|---|---|---|---|
| fernandotonon/QtMeshEditor-lama-onnx | ONNX fp32 | Apache-2.0 | Funcional (`lama_fp32.onnx` servido como `lama.onnx`) | Re-host orientado a QtMeshEditor; 0 descargas; contrato de E/S documentado y medido por el autor |
| Carve/LaMa-ONNX (upstream) | ONNX | Apache-2.0 | Publica `lama.onnx` roto (falla shape inference en `DFT`) y `lama_fp32.onnx` funcional | Origen del grafo; no documenta el contrato de E/S según la model card |
| fernandotonon/QtMeshEditor-models | ONNX (agregado) | Apache-2.0 | Incluye `pbr/lama.onnx` | Repositorio agregado del que tira el runtime de QtMeshEditor |

No se dispone de datos comparativos frente a otras familias de inpainting (MAT, AOT-GAN, modelos de difusión para inpainting) en la información proporcionada, por lo que no se incluyen cifras de rendimiento relativo.

## Limitaciones y advertencias

- Asimetría de rangos entre entrada y salida: la entrada debe ir en [0,1] y la salida sale en 0..255. Alimentar una imagen sin escalar produce un resultado casi blanco (media medida 246,6 frente a 128,6 correcta) sin lanzar ningún error.
- Convención de máscara: 1 significa inpaint y 0 significa conservar. Invertir la máscara degrada el resultado sin aviso.
- Dimensiones fijas: la entrada es estrictamente 512x512; las texturas mayores requieren teselado con solape y mezcla de costuras, lo que puede introducir discontinuidades entre teselas.
- Lote fijo: los shapes declarados son `[1,...]`, por lo que no hay soporte de batch nativo.
- Alucinación generativa: en máscaras grandes el modelo inventa contenido plausible pero no necesariamente fiel al original, algo crítico si la textura debe reproducir un material real.
- Dependencia del backend: los nodos `DFT` pueden no estar soportados por determinados runtimes o aceleradores ONNX.
- Sesgos: no disponible; no se ha publicado ningún análisis de sesgo ni la composición del conjunto de entrenamiento en la model card.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de redactar esta ficha, con lo que no existe confirmación independiente de los resultados declarados.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero el re-host no ofrece garantías y conviene verificar la licencia de los pesos originales en el repositorio upstream y en el artículo antes de un despliegue en producción.
- Ámbito: no procesa texto, no tiene capacidades multilingües y no sirve como modelo de propósito general; cualquier expectativa fuera del inpainting de imágenes queda fuera de su alcance.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fernandotonon/QtMeshEditor-lama-onnx
- Grafo de origen (upstream): https://huggingface.co/Carve/LaMa-ONNX
- Repositorio agregado de modelos: https://huggingface.co/fernandotonon/QtMeshEditor-models
- Aplicación QtMeshEditor: https://github.com/fernandotonon/QtMeshEditor
- Issue de referencia #1017: https://github.com/fernandotonon/QtMeshEditor/issues/1017
- Artículo: Suvorov et al., «Resolution-robust Large Mask Inpainting with Fourier Convolutions», WACV 2022: https://arxiv.org/abs/2109.07161
- Repositorio original de LaMa (referencia general, no citado en la model card): https://github.com/advimman/lama
- Búsqueda web: no se recuperó ningún enlace relevante sobre el modelo; los resultados obtenidos eran páginas genéricas sin relación.
