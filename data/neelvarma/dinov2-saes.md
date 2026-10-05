# neelvarma/dinov2-saes

## Resumen

`neelvarma/dinov2-saes` no es un modelo generativo, sino una colección de artefactos de interpretabilidad mecanicista: 15 autoencoders dispersos (sparse autoencoders, SAE) de tipo TopK entrenados por el autor para descomponer las activaciones internas de DINOv2, el transformer de visión autosupervisado de Meta AI. Los checkpoints se entrenaron sobre la salida del flujo residual de la capa 8 de los modelos `facebook/dinov2-with-registers-small` y `facebook/dinov2-with-registers-base`, y se distribuyen junto con sus configuraciones de entrenamiento, metadatos de evaluación y estadísticas de frecuencia de latentes.

La relevancia del repositorio es de investigación: acompaña al trabajo *The Null Problem in SAE Ablations at Vision Transformer Register Tokens*, centrado en cómo las ablaciones sobre tokens register pueden producir resultados nulos o engañosos si el selector de posiciones no apunta a los tokens correctos. El propio autor documenta una auditoría de procedencia en la que los checkpoints etiquetados como `registers_only` fueron entrenados con un selector histórico que capturaba las cuatro posiciones finales de la secuencia `[257:261)`, en lugar de los verdaderos tokens register de DINOv2-with-registers, situados en `[1:5)`.

El tamaño del repositorio es de 0,4 GB, la licencia de los pesos SAE y del material de investigación es CC BY 4.0, y el código del loader incluido usa MIT. No es un modelo con parámetros en el sentido de un LLM: cada SAE es un par codificador/decodificador lineal con codificación top-k sobre las activaciones del ViT base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder TopK (codificador/decodificador lineal con codificación top-k) sobre activaciones residuales de un Vision Transformer; el modelo base es DINOv2 (ViT) |
| Parametros totales | no disponible; el nombre de cada checkpoint indica el tamano de diccionario (por ejemplo `top_k_128`, `top_k_2048`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo generativo; opera sobre activaciones de un ViT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; procesa representaciones visuales) |
| Licencia | CC BY 4.0 para los pesos SAE y el material de investigacion; MIT para el codigo del loader incluido |
| Formato de pesos | PyTorch (`ae.pt`, state dict cargado mediante `dictionary_learning.trainers.top_k.AutoEncoderTopK`) |

## Arquitectura y entrenamiento

Cada archivo es un autoencoder disperso TopK: un codificador que proyecta activaciones del flujo residual hacia un espacio latente de mayor dimensionalidad, una funcion de activacion que conserva exclusivamente los k elementos de mayor magnitud, y un decodificador que reconstruye la activacion original a partir de esa representacion dispersa. Los checkpoints se entrenaron sobre la salida residual de la capa 8 (`enc_res_out_layer_8`) de dos variantes de DINOv2 con tokens register: la small y la base. El nombre de cada directorio codifica el tamano de diccionario y el nivel de dispersión (por ejemplo `top_k_2048_6_1_...` o `top_k_128_6_0.05_...`).

La colección se publica como material asociado a una investigación sobre el problema nulo en ablaciones de SAE en tokens register de Vision Transformers. El autor preserva los nombres y el comportamiento históricos de los checkpoints `registers_only`, pese a que, según la auditoría incluida en `results/registers_only_provenance_audit/`, estos corresponden a posiciones de parche terminales y no a los verdaderos tokens register. Los SAE empleados en los análisis correctivos cuentan con configuraciones de entrenamiento sobre todos los tokens. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO, que no aplican a este tipo de artefacto.

## Capacidades

- Extraccion de caracteristicas dispersas: descompone activaciones de DINOv2 en un conjunto de latentes interpretables mediante codificacion top-k exacta.
- Analisis de frecuencia de latentes: el repositorio incluye metadatos de frecuencia de latentes para estudiar que caracteristicas se activan y con que asiduidad.
- Soporte de experimentos de ablacion: los checkpoints estan disenados para habilitar estudios de ablacion sobre latentes concretos y sobre tokens register.
- Validacion de checkpoints: `checkpoint_manifest.json` documenta modelo base, capa, dimensiones, dispersión y pertenencia al release de 15 checkpoints del paper.
- Carga mediante loader propio: los state dicts se cargan con `AutoEncoderTopK.from_pretrained`, no con la interfaz `AutoModel` de Transformers.
- No ofrece generacion de texto, razonamiento, codigo, matematicas, vision directa, tool calling ni capacidades de agente; no es un modelo de proposito general.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: analizar que caracteristicas visuales codifica internamente DINOv2 en la capa 8, activando latentes concretos y estudiando su respuesta a estimulos controlados.
- Auditoria de metodologia de ablacion: reproducir y revisar la procedencia de los checkpoints `registers_only` para entender como un selector de posiciones erroneo puede producir resultados nulos espurios.
- Estudio de tokens register: emplear las configuraciones sobre todos los tokens para aislar el papel funcional de los tokens register en el ViT.
- Analisis de frecuencia y muerte de latentes: usar los metadatos incluidos para identificar latentes infrautilizados o redundantes en el diccionario aprendido.
- Comparacion de tamanos de diccionario: contrastar SAE con diccionarios de 128 y 2048 unidades para evaluar el equilibrio entre dispersión y fidelidad de reconstruccion.
- Verificacion de integridad de artefactos de investigacion: validar la reprod u cibilidad del release mediante `sha256sum -c SHA256SUMS` sobre los archivos y sobre los tres archivos comprimidos de `release-assets/`.
- Base para pipelines de analisis visual interpretable: integrar los SAE como etapa de inspeccion en estudios que requieran explicar las representaciones de un backbone de vision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye una prueba de humo (smoke test) de entrada cero con codificacion top-k exacta: 14 de los 15 checkpoints producen salidas finitas y 1 falla por contener valores no finitos. El autor advierte explicitamente de que esta prueba no establece la reproduccion de las metricas reportadas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio completo ocupa 0,4 GB, por lo que los SAE individuales son de tamano reducido.
- GPU recomendadas: al ser autoencoders lineales de pequeña escala, no requieren GPU especifica; pueden ejecutarse en CPU, como muestra el ejemplo del autor (`device="cpu"`).
- Compatibilidad con GPU de consumo: previsiblemente cabe en cualquier GPU de consumo, dado el tamano del artefacto, aunque no se aportan cifras de memoria concretas.
- Opciones de despliegue: carga mediante PyTorch y el loader `dictionary_learning.trainers.top_k.AutoEncoderTopK`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.
- Nota operativa: un checkpoint (`saes/facebook_dinov2-with-registers-small/enc_res_out_layer_8_top_k_128_6_0.05_33958568_registers_only/trainer_0/ae.pt`) contiene valores no finitos y no es apto para inferencia; ademas, ningun checkpoint admite codificacion basada en umbral, solo codificacion top-k exacta.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros releases de SAE comparables con los que contrastar parametros, contexto, rendimiento, licencia y disponibilidad. Como referencia de categoria, existen colecciones de SAE para modelos de lenguaje, pero sus modelos base, dimensiones y objetivos difieren de los de este repositorio de SAE para un backbone de vision, por lo que una comparacion directa carece de datos verificables en esta ficha.

## Limitaciones y advertencias

- No es un modelo generativo ni de proposito general: no genera texto, no razona y no procesa lenguaje; su funcion es descomponer activaciones de un ViT concreto.
- Dependencia del modelo base y de la capa: cada SAE esta atado a `facebook/dinov2-with-registers-small` o `-base` y a la capa 8; los pesos del modelo base y las muestras de ImageNet se obtienen por separado para la reproduccion.
- Checkpoint no valido: uno de los 15 contiene valores no finitos y no es adecuado para inferencia, aunque se conserva por trazabilidad.
- Codificacion por umbral no soportada: ningun checkpoint dispone de buffer de umbral valido; solo funciona la codificacion top-k exacta del loader por defecto.
- Ambiguedad de nomenclatura: los checkpoints `registers_only` no corresponden a los verdaderos tokens register de DINOv2-with-registers, sino a posiciones de parche terminales; interpretarlos como SAE de register unicamente seria un error.
- Alcance de la validacion: la prueba de humo no demuestra la reproduccion de las metricas del paper; se requiere trabajo adicional para verificar los resultados reportados.
- Disponibilidad del codigo fuente de investigacion: el repositorio `github.com/NVarma77/null-problem-sae-ablation` puede estar restringido, lo que limita la reproducibilidad completa.
- Licencia: los pesos SAE y el material de investigacion usan CC BY 4.0, con atribucion obligatoria; el loader usa MIT. Conviene revisar `LICENSE`, `LICENSE-PAPER-DATA.md`, `NOTICE.md` y `LICENSES/` para los terminos de terceros antes de cualquier uso, incluido el comercial.
- Riesgo de sobreinterpretacion: los latentes de un SAE no constituyen por si mismos una explicacion causal del comportamiento del modelo base; las afirmaciones causales requieren experimentos de ablacion validados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/neelvarma/dinov2-saes
- Repositorio del paper (acceso posiblemente restringido): https://github.com/NVarma77/null-problem-sae-ablation
- DINOv2 en Hugging Face Transformers: https://huggingface.co/docs/transformers/main//model_doc/dinov2
- Repositorio oficial de DINOv2 (Meta AI, FAIR): https://github.com/facebookresearch/dinov2
- Sitio de DINOv2: https://dinov2.metademolab.com/
- Articulo de referencia sobre DINO, DINOv2 y DINOv3: https://www.mlguerrilla.com/models/dino
- Vision Transformers Need Registers (paper citado por el repositorio oficial): https://github.com/facebookresearch/dinov2
- DINOv2: Learning Robust Visual Features without Supervision (paper citado por el repositorio oficial): https://github.com/facebookresearch/dinov2
