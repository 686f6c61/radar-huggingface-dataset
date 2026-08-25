# AuroraRyan/PartTrellis

## Resumen

PartTrellis es un modelo de generacion de objetos 3D con conciencia de partes (part-aware) a partir de una imagen, desarrollado por el usuario AuroraRyan y publicado en Hugging Face bajo licencia MIT. El modelo se basa en la arquitectura TRELLIS.2 y su representación O-Voxel, pero introduce una innovación clave: en lugar de generar una única malla continua, empaqueta las partes del objeto en dos volúmenes intercalados (un grafo de contacto contraído hasta ser bipartito) y ejecuta un flujo rectificado de dos streams sobre esa representación. Cada parte se decodifica como un sub-mesh cerrado y limpio, sin necesidad de ejecutar un segmentador posterior.

Este enfoque resuelve un problema relevante en la generación 3D: la producción de objetos compuestos por múltiples componentes separables, lo que facilita su uso en animación, edición, simulación física o ensamblaje. El modelo se presenta con checkpoints de la tubería completa, checkpoints de ablación y código fuente para reproducir los experimentos. No se especifican los parámetros totales exactos, pero el tamaño del repositorio (27,1 GB) y los archivos de pesos sugieren un modelo de varios miles de millones de parámetros, coherente con la escala de TRELLIS.2-4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TRELLIS.2 O-Voxel con flujo rectificado de dos streams y dos volúmenes intercalados |
| Parametros totales | no disponible (pesos de stage1, stage2 y decoder; el decoder es el stock de TRELLIS.2-4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: imagen; salida: malla 3D) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo no es de lenguaje) |
| Licencia | MIT (para el código y checkpoints propios; los componentes externos tienen sus propias licencias) |
| Formato de pesos | .pt (PyTorch) y safetensors (el decoder se convierte de safetensors a .pt) |

## Arquitectura y entrenamiento

PartTrellis se apoya en la representación O-Voxel de TRELLIS.2, que es un campo de vóxeles sin campos explícitos (field-free). El proceso de entrenamiento se divide en dos etapas:

1. **Stage-1 (layout flow)**: un flujo rectificado que genera la estructura espacial de las partes. Usa pesos separados por stream, entrada/salida por stream y una pérdida de disyunción (L_ov) con peso 5 para asegurar que los volúmenes no se solapen.
2. **Stage-2 (SLat flow)**: un flujo de rectificado sobre el espacio latente del VAE original de TRELLIS.2, que produce las características de las partes.

El decodificador de SLat es el archivo `shape_dec_next_dc_f16c32_fp16.pt`, que es idéntico al `shape_dec_next_dc_f16c32_fp16.safetensors` del repositorio `microsoft/TRELLIS.2-4B`. La decodificación de la estructura dispersa usa el `ss_dec_conv3d_16l8_fp16` de `microsoft/TRELLIS-image-large`, descargado automáticamente. El acondicionamiento de imagen se realiza mediante el modelo gated `facebook/dinov3-vitl16-pretrain-lvd1689m`.

La innovación principal es el empaquetado de las partes en dos volúmenes intercalados, lo que reduce el coste de tokens frente a representaciones como OmniPart (que usa tres volúmenes) y permite que cada parte sea un sub-mesh cerrado y limpio sin post-procesado de segmentación.

## Capacidades

- Generación de mallas 3D con partes separadas y limpias a partir de una imagen de entrada.
- Cada parte se produce como un sub-mesh cerrado, sin necesidad de un segmentador posterior.
- Soporte de múltiples partes por objeto (el número de partes viene determinado por la imagen y el modelo).
- Representación field-free: los meshes se voxelizan directamente tras normalización rígida, sin remeshing ni reparación de agua.
- Acondicionamiento por imagen mediante DINOv3 (ViT-L/16).
- Compatible con el ecosistema TRELLIS (código y pesos de TRELLIS.2 y TRELLIS v1).
- No incluye capacidades de tool calling, agentes o procesamiento de lenguaje, ya que es un modelo de visión y generación 3D.

## Casos de uso

- **Animación y rigging**: al generar cada parte como un sub-mesh independiente, los artistas pueden asignar huesos y articulaciones directamente sin separar manualmente la malla.
- **Edición de objetos 3D**: permite modificar una parte específica (por ejemplo, cambiar la tapa de una botella) sin afectar al resto.
- **Simulación física**: las partes separadas se pueden usar como cuerpos rígidos en motores de física, facilitando la simulación de desensamblajes o roturas.
- **Ensamblaje y diseño industrial**: para prototipos de piezas, el modelo puede generar componentes individuales a partir de una imagen de referencia, útil en CAD inverso.
- **Videojuegos**: creación de assets con partes intercambiables (armas, vehículos, personajes) para personalización o modificación dinámica.
- **Impresión 3D**: permite obtener piezas separadas para imprimir por separado y ensamblar después, evitando estructuras de soporte complejas.
- **Investigación en visión por computador**: sirve como baseline para tareas de segmentación de partes y razonamiento de estructura 3D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (CD/F1, etc.) ni comparaciones numéricas con otros métodos. Se menciona que el proyecto incluye scripts de evaluación, pero no se presentan resultados.

## Requisitos de hardware

- El repositorio ocupa 27,1 GB, lo que sugiere que los checkpoints son pesados (el decoder de TRELLIS.2-4B ya es de ~4B parámetros).
- Para la inferencia, se necesita una GPU con al menos 16-24 GB de VRAM para cargar el modelo completo en FP16. Se recomienda una RTX 4090, A100 o H100.
- El código está pensado para CUDA (se menciona cu126 wheels para driver 570), por lo que se requiere una GPU NVIDIA.
- Se puede ejecutar en modo offline (`HF_HUB_OFFLINE=1`) para los nodos de clúster.
- No se indican opciones de despliegue como vLLM u Ollama, ya que no es un modelo de lenguaje; el despliegue se hace con el script de inferencia `infer_e2e_dual.py`.

## Comparativa con modelos similares

| Modelo | Representación | Partes | Licencia | Contexto |
|---|---|---|---|---|
| PartTrellis | O-Voxel + 2 volúmenes bipartitos | Sí, sin segmentación posterior | MIT | Imagen a 3D |
| Hunyuan3D-Part (X-Part / P3-SAM) | Partes de SAM | Sí | no disponible | Imagen a 3D |
| OmniPart | Representación de partes con 3 volúmenes | Sí | no disponible | Imagen a 3D |
| PartPacker | Empaquetado de partes | Sí | no disponible | Imagen a 3D |

No se dispone de datos de rendimiento comparativo (CD/F1, etc.) en la información proporcionada. Los modelos mencionados son los baselines que se citan en la model card, pero sin resultados numéricos.

## Limitaciones y advertencias

- El modelo es de generación 3D y no tiene capacidades de lenguaje ni razonamiento textual.
- Depende de componentes externos con licencias propias: el acondicionador DINOv3 está gated (requiere aceptar licencia de Facebook) y los pesos de TRELLIS.2 tienen su propia licencia (MIT, pero hay que verificar).
- La entrada es una imagen; la calidad de la generación depende de la calidad de la imagen y de la variedad de objetos en el entrenamiento.
- El modelo no está diseñado para generar objetos con partes móviles o articulaciones; solo produce mallas estáticas.
- No se han documentado sesgos específicos, pero como cualquier modelo generativo 3D, puede tener problemas con objetos poco representados en el entrenamiento o con imágenes de baja resolución.
- Para uso en producción, es necesario validar la calidad de las mallas generadas, especialmente para aplicaciones que requieren precisión geométrica (por ejemplo, ingeniería o CAD).

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/AuroraRyan/PartTrellis
- Código de TRELLIS.2: https://github.com/microsoft/TRELLIS.2
- Pesos de TRELLIS.2: https://huggingface.co/microsoft/TRELLIS.2-4B
- Pesos de TRELLIS v1 (ss decoder): https://huggingface.co/microsoft/TRELLIS-image-large
- Acondicionador DINOv3: https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m (gated)
- Baselines: X-Part / P3-SAM (https://github.com/Tencent-Hunyuan/Hunyuan3D-Part), Hunyuan3D-2.1 (https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1), OmniPart (https://github.com/HKU-MMLab/OmniPart), PartPacker (https://github.com/NVlabs/PartPacker)
- Kit de renderizado Blender: https://github.com/AuroraRyan0301/Blender-Visualization-Skill
