# creador/sf3d-color-onnx

## Resumen

`creador/sf3d-color-onnx` es un componente ONNX derivado de Stable Fast 3D, el modelo de reconstruccion image-to-3D de Stability AI. No se trata de un modelo completo, sino de una cabeza de color (color head) que devuelve el albedo de Stable Fast 3D en puntos arbitrarios del triplano generado por el backbone del modelo original. El autor del repositorio es el usuario `creador` y el artefacto principal es un unico fichero `sf3d_color.onnx` de 70.720 bytes (69 KB).

El modelo resuelve un problema muy concreto: permitir el coloreado de mallas 3D en el navegador sin necesidad de ejecutar el decodificador completo de Stable Fast 3D. Toma como entrada el triplano de salida del backbone (tensor de forma `[batch, 3, 40, 384, 384]`) y un conjunto de posiciones 3D en el marco de consulta ±0.87 del decodificador, y devuelve colores sRGB en el rango 0–1. Es relevante para desarrolladores que quieran portar la fase de texturizado de Stable Fast 3D a WebGPU mediante onnxruntime-web.

Conviene subrayar que el grafo no ha sido entrenado: se ha ensamblado a partir de piezas existentes. Concretamente, combina la consulta al triplano del `decoder_single.onnx` publicado por needle-tools en su repositorio SF3D-webgpu (los nodos hasta la caracteristica de 120 canales) con la cabeza `features` del MaterialMLP de Stable Fast 3D (120 → 64 → 64 → 64 → 3, con SiLU entre capas y sigmoide final), cuyos pesos se publican como `features_mlp_weights.json`. El script de construccion y su comprobacion numerica viven en el repositorio de WaveSlice, bajo `tools/sf3d-color-onnx/`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP sobre consulta a triplano (derivada de Stable Fast 3D), exportada a ONNX |
| Parametros totales | no disponible (pesos de la cabeza: 120 → 64 → 64 → 64 → 3; tamano del fichero 70.720 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (el artefacto es un grafo ONNX en precision original) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Stability AI Community License (`stabilityai-community`, fichero LICENSE.md y NOTICE) |
| Formato de pesos | ONNX (`sf3d_color.onnx`) |
| Entrada | `triplane [batch, 3, 40, 384, 384]` y `positions [batch, points, 3]` (marco ±0.87) |
| Salida | `color [batch, points, 3]`, sRGB en 0–1 |
| SHA-256 | `29544148c0e42b1d8d6ac229af81c2ed8c361fcf4cbf35bf9c40f2d20dbb56a6` |

## Arquitectura y entrenamiento

El grafo es un ensamblaje, no un modelo entrenado de nuevo. La primera parte reproduce la consulta al triplano del decodificador de Stable Fast 3D tal como aparece en `onnx/decoder_single.onnx` de needle-tools/SF3D-webgpu, hasta obtener la caracteristica de 120 canales. La segunda parte aplica la cabeza `features` del MaterialMLP del modelo original: una MLP de 120 → 64 → 64 → 64 → 3 con activaciones SiLU entre capas y una sigmoide final que restringe la salida al rango 0–1 propio del espacio sRGB.

No hay datos de entrenamiento propios, ni tokens, ni proceso de RLHF/DPO asociado a este artefacto: los pesos proceden del modelo base `stabilityai/stable-fast-3d` y del export compartido de needle-tools. La innovacion tecnica es la modularizacion: separar la cabeza de color permite ejecutar solo esa fase en el navegador con onnxruntime-web y WebGPU, integrandola en el motor de reconstruccion de Stable Fast 3D de WaveSlice (waveslice3d.com) para colorear las mallas generadas sin cargar el decodificador completo.

## Capacidades

- Prediccion de albedo (color base) en puntos 3D arbitrarios del triplano de Stable Fast 3D.
- Consulta por lotes: acepta multiples puntos por invocacion mediante la dimension `points`.
- Salida en sRGB normalizado en 0–1, lista para mapear sobre mallas.
- Ejecucion en navegador mediante onnxruntime-web con backend WebGPU.
- Integrable como etapa de texturizado dentro de un pipeline image-to-3D mas amplio.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes ni capacidades multilingues: su alcance es exclusivamente el coloreado de geometria 3D.

## Casos de uso

- Texturizado de mallas en el navegador: tras ejecutar el backbone de Stable Fast 3D en WebGPU, se consulta esta cabeza con las posiciones de los vertices de la malla para obtener su albedo, evitando cargar el decodificador completo en el cliente.
- Visores 3D interactivos: aplicaciones web que reconstruyen un objeto a partir de una imagen y necesitan colorear la malla resultante en tiempo real sin backend.
- Prototipado de pipelines image-to-3D: util para experimentar con la fase de color de forma aislada, sustituyendo o comparando cabezas de material.
- Herramientas de edicion de mallas: recolorear selectivamente regiones consultando el albedo en puntos concretos del triplano original.
- Demo y educacion: ejemplo compacto (69 KB) de como exportar y ejecutar un subgrafo de un modelo 3D en ONNX y WebGPU.
- Integracion en motores de reconstruccion propios: cualquier proyecto que ya produzca un triplano con la forma esperada puede reutilizar esta cabeza para obtener color.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente menciona una comprobacion numerica del ensamblaje en el repositorio de WaveSlice (`tools/sf3d-color-onnx/`), sin cifras publicadas.

## Requisitos de hardware

- VRAM estimada: no disponible; el fichero pesa 69 KB, por lo que el cuello de botella es el tensor de triplano de entrada (`[batch, 3, 40, 384, 384]`) y el numero de puntos consultados, no los pesos.
- GPU recomendadas: cualquier GPU con soporte WebGPU para el caso de navegador; en servidor, no disponible.
- Cabe en GPU de consumo: si, al ser un grafo minimo; el requisito real depende del backbone que genere el triplano.
- Opciones de despliegue: onnxruntime-web con WebGPU (caso documentado); ONNX Runtime nativo para otros entornos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `creador/sf3d-color-onnx` | Cabeza de color ONNX (subgrafo) | no disponible (69 KB) | no aplica | Stability AI Community | Hugging Face |
| `stabilityai/stable-fast-3d` | Modelo image-to-3D completo | no disponible en la informacion | no aplica | Stability AI Community | Hugging Face |
| `needle-tools/SF3D-webgpu` | Export ONNX/WebGPU de Stable Fast 3D | no disponible en la informacion | no aplica | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere un triplano de entrada con la forma exacta `[batch, 3, 40, 384, 384]` generado por el backbone de Stable Fast 3D.
- Solo produce color (albedo); no genera geometria, normales ni otros mapas de material.
- Las posiciones deben expresarse en el mismo marco de consulta ±0.87 que el decodificador original.
- Al ser un ensamblaje de piezas, su fidelidad depende de la correspondencia exacta entre el export de needle-tools y los pesos del MaterialMLP publicados.
- Licencia Stability AI Community: revisar LICENSE.md y NOTICE antes de uso comercial; incluye obligaciones de atribucion ("Powered by Stability AI").
- Sin datos publicados de sesgos, alucinacion o calidad perceptual del color; no disponibles.
- No procesa texto ni idiomas, por lo que las limitaciones linguisticas no aplican.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/creador/sf3d-color-onnx
- Modelo base: https://huggingface.co/stabilityai/stable-fast-3d
- Export de referencia: https://huggingface.co/needle-tools/SF3D-webgpu/tree/56d2f58d27395b0be9c633671b439b4aac482549
- Demo en navegador: https://waveslice3d.com
- Licencia: LICENSE.md en el repositorio del modelo
