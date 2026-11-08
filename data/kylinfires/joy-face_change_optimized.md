# kylinfires/Joy-face_change_optimized

## Resumen

Joy-face_change_optimized es un fork de despliegue del modelo de edición de vídeo JoyAI-Video-Edit, desarrollado originalmente por JD Open Source bajo licencia Apache-2.0. El fork, mantenido por el usuario kylinfires, no introduce un modelo nuevo sino un conjunto de herramientas de portabilidad y cuantización orientadas a reducir el coste de inferencia del transformer de difusión (DiT) que gobierna la generación. El repositorio de Hugging Face no contiene pesos publicados (tamaño de 0.0 GB, cero descargas), por lo que debe entenderse como un paquete de código y recetas más que como un checkpoint listo para usar.

La contribución principal es la sustitución de los kernels CUDA propietarios `joyomni_ops` por implementaciones equivalentes en PyTorch puro, validadas tensor a tensor con un 99,997 % de elementos idénticos y una desviación máxima de un ulp en bf16. Esto habilita la ejecución en ROCm y CPU mediante fallback automático. Sobre esa base se añaden capas Linear weight-only en int4 (agrupado) e int8 (por canal), junto con tres recetas de cuantización y un cliente WebSocket sin interfaz gráfica para validación automatizada.

La relevancia del fork reside en sus conclusiones empíricas medidas sobre el propio modelo: la cuantización a int4 destruye la capacidad de sustitución de identidad guiada por imagen de referencia, mientras que int8 la preserva e incluso la mejora ligeramente frente a bf16. El autor documenta además una optimización en curso para descargar el flujo de texto a RAM de host, lo que reduciría el requisito de VRAM de 23,9 GB a unos 15,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) con flujos separados de imagen y texto; 40 bloques |
| Parametros totales | Aproximadamente 16,1 B (8,05 B flujo de imagen + 8,05 B flujo de texto) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16, int8 por canal, int4 agrupado (gs=64), mixta attn-int8 + MLP-int4 (gs=16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (heredada de JoyAI-Video-Edit) |
| Formato de pesos | `.pth` original, safetensors bf16 fragmentados, state-dict cuantizado |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de difusión para edición de vídeo condicionada por imagen de referencia e instrucción textual. Cada uno de los 40 bloques contiene dos ramas paralelas de tamaño idéntico: `img_attn + img_mlp` (201 M por bloque, 8,05 B en total, 49,5 %) y `txt_attn + txt_mlp` (otros 201 M por bloque, 8,05 B, 49,5 %). La información de identidad de la persona de referencia circula exclusivamente por la ruta de atención, hallazgo confirmado por los experimentos de cuantización selectiva del autor.

El fork no reentrena el modelo: los pesos son los originales de JoyAI-Video-Edit. Lo que se modifica es la ruta de ejecución. `fused_ops_torch.py` replica en PyTorch las operaciones LayerNorm+modulate, QK-norm con RoPE 3D y RMSNorm que el modelo original ejecuta mediante kernels CUDA; `sgl_fused_ops.py` actúa como capa de fallback cuando `joyomni_ops` no está disponible. `int4_linear.py` implementa las capas Linear weight-only con sus cargadores de state-dict, y `models.py` incorpora dos rutas de carga adicionales mediante las variables de entorno `JOYOMNI_DIT_SD_DIR` (fragmentos bf16) y `JOYOMNI_DIT_INT4_DIR` (pesos cuantizados). No se documentan en la información disponible datos sobre el corpus de entrenamiento, número de tokens, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Edición de vídeo condicionada por imagen de referencia: sustitución de la persona del vídeo original por la identidad de una imagen de referencia, manteniendo la instrucción textual.
- Generación de secuencias de fotogramas gobernada por un DiT con atención conjunta imagen-texto.
- Ejecución en GPU NVIDIA mediante kernels CUDA originales o en PyTorch puro.
- Ejecución en ROCm y CPU mediante fallback automático de operadores.
- Cuantización weight-only int8 e int4 con scripts reproducibles.
- Control remoto sin interfaz gráfica mediante cliente WebSocket que acepta referencia, instrucción y secuencia de fotogramas.
- Determinismo entre reinicios del proceso: con los mismos pesos int4, dos procesos nuevos producen 138 dB de PSNR entre sí.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes ni procesamiento de audio.

## Casos de uso

- Sustitución de identidad en postproducción de vídeo: el modelo recibe una imagen de referencia y una secuencia original y regenera los fotogramas con el rostro de la referencia; el fork permite ejecutarlo en int8 conservando una similitud de identidad de 0,359, superior al 0,314 de bf16.
- Despliegue en infraestructura AMD: gracias al fallback en PyTorch puro de `sgl_fused_ops.py`, el pipeline puede ejecutarse en ROCm sin depender de los kernels CUDA propietarios, lo que amplía la base de hardware compatible.
- Validación automatizada en CI: `tools/jve_client.py` permite lanzar sesiones headless por WebSocket con referencia, instrucción y fotogramas fijos, lo que facilita pruebas de regresión deterministas entre versiones del código.
- Reducción de huella de VRAM en servidores de 24 GB: con int8 el peso del DiT baja de 31,8 GB a 15,2 GiB, y sumado a VAE, grafo y cachés KV el total se sitúa en torno a 23,9 GB, ajustándose a tarjetas de 24 GB.
- Investigación sobre cuantización de DiT: las tres recetas de `tools/quantization/` y las métricas de PSNR e identidad publicadas permiten reproducir el estudio de sensibilidad por ruta (atención frente a MLP) y extenderlo a otros modelos de difusión.
- Prototipado de efectos de sustitución facial en 840×480: la resolución medida por el autor sirve como punto de partida para evaluar calidad y latencia antes de escalar a producción.
- Preparación para hardware de 16 GB: la optimización en curso de descarga del flujo de texto a RAM de host apunta a unos 15,8 GB de VRAM con calidad int8, habilitando tarjetas consumer de gama alta.

## Benchmarks y rendimiento

| Precision | Tamano de pesos | PSNR frente a bf16 | Similitud de identidad |
|---|---:|---:|---:|
| bf16 (base) | 31,8 GB | — | 0,314 |
| int8 por canal | 15,2 GiB | 21,8 dB | 0,359 |
| attn int8 + MLP int4 (gs=16) | 11,4 GiB | 19,2 dB | 0,199 |
| int4 (gs=64) | 8,1 GiB | 19,0 dB | 0,103 |

Mediciones realizadas a 840×480 con los mismos pesos, material y prompt. El pipeline es determinista entre reinicios (138 dB de PSNR con pesos int4 idénticos en dos procesos nuevos), por lo que las diferencias reflejan pérdida real de calidad y no ruido de medición. Un experimento adicional del autor muestra que cuantizar solo la atención a int4, manteniendo el MLP en bf16, hace caer la similitud de identidad a 0,027, lo que confirma que la señal de identidad reside íntegramente en la ruta de atención. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: 31,8 GB solo para los pesos del DiT; con VAE, grafo y cachés KV el total ronda los 40 GB.
- VRAM estimada en int8: 15,2 GiB de pesos; total del pipeline en torno a 23,9 GB, viable en tarjetas de 24 GB.
- VRAM estimada en int4: 8,1 GiB de pesos, pero con pérdida severa de la capacidad de sustitución de identidad.
- Objetivo declarado tras la optimización de descarga del flujo de texto: unos 15,8 GB de VRAM (8,05 GB de flujo de imagen + 7,7 GB de VAE, grafo y KV), lo que habilitaría tarjetas de 16 GB con calidad int8.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; los requisitos de memoria apuntan a A100 40 GB o H100 para bf16, y a RTX 4090 (24 GB) o A6000 para int8.
- Compatibilidad consumer: int8 cabe en RTX 4090; int4 cabría en tarjetas de 12 GB, pero con degradación inaceptable de la identidad.
- Opciones de despliegue: servidor propio mediante `deploy/run_server.sh`, con selección de pesos por variables de entorno (`JOYOMNI_DIT_SD_DIR`, `JOYOMNI_DIT_INT4_DIR`). No se documenta integración con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor estima una mejora del 30-40 % en la tasa de fotogramas por chunk tras eliminar el cómputo de `txt_mlp` en cada paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Joy-face_change_optimized | ~16,1 B (DiT, 40 bloques) | No disponible | bf16, int8, int4, mixta | Apache-2.0 | Repo de codigo en HF (sin pesos) |
| JoyAI-Video-Edit (original) | ~16,1 B (DiT, 40 bloques) | No disponible | bf16 | Apache-2.0 | GitHub y pesos originales |
| Alternativas de edicion de video por difusion | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación se limita al modelo original, del que este fork hereda arquitectura y pesos. No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El repositorio de Hugging Face no contiene pesos (0.0 GB); es un fork de código y recetas, no un checkpoint autónomo. Requiere obtener los pesos de JoyAI-Video-Edit por separado.
- La cuantización int4 destruye la capacidad de sustitución de identidad guiada por referencia (similitud 0,103 frente a 0,314 en bf16); no es apta para el caso de uso principal.
- La cuantización mixta attn-int8 + MLP-int4 también degrada la identidad de forma apreciable (0,199).
- La optimización de descarga del flujo de texto está en estado de diseño: el propio autor indica que la implementación está pendiente y fija un criterio de aceptación de PSNR superior a 40 dB y diferencia de identidad inferior a 0,01.
- El fork no aporta datos sobre sesgos del modelo base, riesgo de alucinación visual, cobertura idiomática ni límites de contexto.
- No se documentan resultados en benchmarks estándar, por lo que la comparación con otros modelos de edición de vídeo no puede cuantificarse.
- La licencia Apache-2.0 permite uso comercial, pero las modificaciones deben documentarse; el repositorio incluye un fichero `NOTICE` con la lista de archivos modificados.
- El pipeline es determinista entre reinicios, lo que facilita la depuración, pero no se documenta comportamiento bajo cargas concurrentes ni latencia en producción.
- El soporte de ROCm y CPU depende del fallback en PyTorch puro y no se han publicado métricas de rendimiento en esas plataformas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kylinfires/Joy-face_change_optimized
- Repositorio GitHub del fork: https://github.com/q760440238/Joy-face_change_optimized
- Modelo en ModelScope: https://www.modelscope.cn/models/kylinfires/Joy-face_change_optimized
- Proyecto original JoyAI-Video-Edit: https://github.com/jd-opensource/JoyAI-Video-Edit
- Perfil del autor en Hugging Face: https://huggingface.co/kylinfires
