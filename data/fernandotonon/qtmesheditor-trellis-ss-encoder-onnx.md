# fernandotonon/QtMeshEditor-trellis-ss-encoder-onnx

## Resumen

Este repositorio no contiene un modelo generativo completo, sino la exportación a ONNX del codificador VAE de estructura dispersa (`ss_enc_conv3d_16l8_fp16`) del modelo TRELLIS-image-large de Microsoft, realizada por fernandotonon. El artefacto resultante, `ss_encoder.onnx`, es un componente de un solo paso que convierte una rejilla de ocupación 3D en un latente de estructura dispersa, y se utiliza como pieza auxiliar dentro del ecosistema QtMeshEditor y del runtime trellis.cpp.

Su función concreta es habilitar el control de forma ("shape guide") en la generación image-to-3D de TRELLIS.2 sin reentrenamiento, al estilo de SpaceControl: el usuario aporta un blockout aproximado (una casa, un vehículo, un cuerpo) y el codificador lo transforma en un latente que condiciona el muestreo del modelo de flujo, de modo que el resultado conserva la apariencia de la imagen de entrada pero respeta el tamaño, la colocación y el volumen de la guía.

Es relevante porque el runtime nativo trellis.cpp solo incluía el decodificador del VAE; esta exportación cubre la mitad que faltaba del camino de codificación, con una verificación numérica estricta (diferencia máxima de 2e-5 frente a PyTorch) y un hash SHA-256 fijado en la aplicación cliente. El repositorio pesa 0,2 GB y aloja únicamente el grafo ONNX y la licencia del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE convolucional 3D disperso (codificador `ss_enc_conv3d_16l8_fp16` de TRELLIS), exportado a grafo ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada voxelizada de 64x64x64) |
| Tipos de cuantizacion | no disponible (el artefacto publicado es fp32; el checkpoint original es fp16) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (`ss_encoder.onnx`, opset 17, ~237 MB) |

## Arquitectura y entrenamiento

El modelo es un codificador VAE convolucional 3D que opera sobre una rejilla de ocupación de 64x64x64 vóxeles (eje Z hacia arriba) y produce un latente de 8 canales y resolución 16x16x16, es decir, un factor de compresión espacial de 4x por eje. La entrada contiene vóxeles de superficie con valores 0 o 1, correspondientes a la malla guía centrada y escalada para que su lado mayor ocupe 0,95 del cubo [-0,5, 0,5] antes de la voxelización. La salida es la media de la posterior, sin muestreo estocástico.

No se ha entrenado ningún modelo nuevo: los pesos proceden de microsoft/TRELLIS-image-large y TRELLIS.2 reutiliza el mismo VAE de estructura dispersa que TRELLIS-1. La innovación técnica del repositorio es la exportación en sí, realizada con `torch.onnx.export` mediante el script `scripts/export-trellis-ss-encoder-onnx.py` del repositorio QtMeshEditor, que rechaza escribir el grafo si la salida difiere de la de PyTorch en más de 2e-5 sobre un blockout de prueba. En el muestreador de TRELLIS.2 el latente se dispone como `[4096][8]` (celda `x*256 + y*16 + z`, canal como dimensión más rápida) y se mezcla con ruido según `t0 * noise + (1 - t0) * latent`, donde una mayor fuerza de guía implica un `t0` menor.

## Capacidades

- Codificación de blockouts 3D en latentes de estructura dispersa compatibles con el muestreador de TRELLIS.2.
- Control de forma training-free en generación image-to-3D: preserva la apariencia de la imagen y respeta tamaño, colocación y volumen de la guía.
- Integración en CLI (`qtmesh generate3d image.png --backend trellis2 --guide house --guide-strength 0.5`), en la interfaz gráfica (fila "Shape guide") y en el servidor MCP (argumento `guide`).
- Verificación de integridad mediante SHA-256 fijado en `src/ImageTo3D/ShapeGuide.cpp`.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, visión directa ni audio: es un componente de un solo paso dentro de un pipeline mayor.
- No tiene capacidades multilingües ni procesa lenguaje natural.

## Casos de uso

- Modelado 3D asistido por boceto: el usuario construye un blockout tosco en QtMeshEditor y el codificador lo convierte en latente guía para que TRELLIS.2 genere una malla detallada con las proporciones y la posición del boceto.
- Sustitución de objetos manteniendo el volumen: a partir de una foto de referencia y una caja o silueta guía, se generan variantes (una casa, un vehículo) que ocupan exactamente el espacio previsto en la escena.
- Integración en pipelines automatizados de assets: el CLI `qtmesh generate3d` permite encadenar la generación con guía de forma en scripts de producción por lotes, sin intervención manual.
- Control de forma dentro de un agente: el argumento `guide` del servidor MCP permite que un agente externo solicite generaciones condicionadas por geometría.
- Prototipado rápido en desarrollo de videojuegos: generar variantes de props que respeten el volumen reservado en el nivel, reduciendo el retrabajo de escalado y colocación.
- Investigación en control geométrico de modelos generativos: al ser un export ONNX verificado numéricamente, sirve como referencia reproducible para estudiar el efecto de la fuerza de guía (`t0`) en el muestreo.
- Despliegue ligero: al ser un grafo ONNX de ~237 MB, puede ejecutarse con ONNX Runtime en entornos sin PyTorch, integrándose en la aplicación de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato cuantitativo de calidad es la tolerancia de exportación: la salida ONNX no debe diferir de la de PyTorch en más de 2e-5 sobre un blockout de prueba.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el grafo fp32 ocupa ~237 MB en disco, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con al menos 1-2 GB libres, además del resto del pipeline TRELLIS.2.
- GPU recomendadas: no disponible; al ejecutarse vía ONNX Runtime, es compatible con GPU NVIDIA (CUDA) y CPU.
- Cabe en GPU consumer: sí, con margen amplio, dado el tamaño reducido del codificador.
- Opciones de despliegue: ONNX Runtime (integración nativa en QtMeshEditor), runtime trellis.cpp para el resto del pipeline; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este repositorio (ss_encoder ONNX) | Codificador VAE 3D disperso exportado | Ocupación 64³ → latente 8x16x16x16 | MIT | Hugging Face, ONNX |
| microsoft/TRELLIS-image-large | Pipeline completo image-to-3D | Imagen → malla 3D | MIT | Hugging Face |
| VAE de TRELLIS.2 (decodificador en trellis.cpp) | Decodificador VAE 3D disperso | Latente → estructura dispersa | MIT | Repositorio trellis.cpp |
| Alternativas de image-to-3D con control de forma | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es funcional: frente al pipeline TRELLIS completo, este artefacto aísla únicamente la etapa de codificación para permitir control geométrico en el runtime nativo; frente al decodificador de trellis.cpp, cubre la dirección inversa del mismo VAE.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el resto del pipeline TRELLIS.2 (modelo de flujo y decodificador) no produce mallas utilizables.
- La guía se limita a una rejilla de 64³ vóxeles, lo que impone una resolución geométrica gruesa y puede perder detalles finos del blockout.
- El escalado y centrado de la malla guía es fijo (lado mayor a 0,95 del cubo), por lo que guías con proporciones extremas pueden verse distorsionadas.
- Riesgo de alucinación geométrica: el resultado sigue la guía solo de forma aproximada, modulada por `guide-strength`; no hay garantía de coincidencia exacta con el volumen de entrada.
- Sesgos: no disponibles; al no procesar texto ni datos personales, los sesgos sociales típicos no aplican, pero la calidad depende de la distribución de formas del entrenamiento original de TRELLIS.
- Restricciones de licencia: MIT, igual que el código y pesos originales de Microsoft; se incluye `LICENSE-TRELLIS.txt` y se recomienda conservar la atribución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; el archivo que descarga QtMeshEditor en tiempo de ejecución reside en el repositorio compartido `fernandotonon/QtMeshEditor-models`, bajo `trellis2/`, y este repositorio es un espejo con model card independiente.
- La integridad del artefacto depende de la verificación SHA-256 en la aplicación cliente; un uso fuera de QtMeshEditor debe replicar esa comprobación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fernandotonon/QtMeshEditor-trellis-ss-encoder-onnx
- Modelo base: https://huggingface.co/microsoft/TRELLIS-image-large
- Repositorio espejo de modelos de QtMeshEditor: https://huggingface.co/fernandotonon/QtMeshEditor-models
- QtMeshEditor (aplicación): https://github.com/fernandotonon/QtMeshEditor
- Runtime trellis.cpp: https://github.com/fernandotonon/trellis.cpp
