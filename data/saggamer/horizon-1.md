# saggamer/horizon-1

## Resumen

Horizon 1 es un adaptador experimental de edición de imagen guiada por instrucciones, desarrollado por el usuario saggamer y publicado bajo licencia Apache 2.0. No es un modelo fundacional independiente: se trata de un bundle de aproximadamente 45 MB que contiene un adaptador LoRA entrenado, un puente semántico, un módulo de grounding de instrucciones y controles espaciales, todo portado a MLX para su ejecución en Apple Silicon. Se apoya en el checkpoint base FLUX.2 Klein 4B en cuantización 4-bit, que se descarga por separado (unos 4,6 GB en el primer arranque).

El modelo resuelve una tarea concreta: recibir una imagen fuente y una instrucción en lenguaje natural, predecir la región espacial donde debe aplicarse la edición y generar una imagen modificada respetando esa localización. Para ello combina el transformer de difusión conjunto texto/imagen de FLUX.2 con una cabeza de grounding que produce una rejilla de probabilidad de edición de 32 × 32, y opcionalmente aplica una restricción de latentes que preserva la trayectoria fuente/ruido fuera de la región predicha.

Es relevante ahora porque explora el paradigma de edición localizada sobre Apple Silicon con un stack MLX/MFLUX, una combinación poco frecuente en el ecosistema de difusión. El propio autor lo describe como una release de investigación, no como un editor listo para producción, y advierte que la adherencia a instrucciones sobre fotografías reales sigue siendo limitada. No incluye modelo de chat, especialista en creatividad ni generación de PPT/PDF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion conjunto texto/imagen (FLUX.2 Klein base 4B) con adaptador LoRA, puente semantico y cabeza de grounding |
| Parametros totales | 4B en el checkpoint base FLUX.2 Klein; el adaptador es un bundle de ~45 MB (no disponible el desglose exacto de parametros del adaptador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens de instruccion (plantilla nativa completa; instrucciones mayores se rechazan) |
| Tipos de cuantizacion | 4-bit en backbone y encoder de texto; LoRA sin hornear como residuo; cabeza de grounding y puente semantico en FP32; computo de atencion/feed-forward en float16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | MLX (checkpoint 4-bit de MFLUX); bundle de adaptador instalable como paquete Python |

## Arquitectura y entrenamiento

Horizon 1 se construye como un puente sobre el transformer de difusion nativo de FLUX.2, no como una reimplementacion de la arquitectura completa de mezcla de transformers de BAGEL ni como un modelo de lenguaje unificado preentrenado desde cero. El adaptador incorpora 120 tensores LoRA de rango 16 mapeados a las 60 capas nativas del transformer, cargados sin hornearse en la base cuantizada. Ademas incluye un puente semantico con compuerta de modo que opera sobre el contexto nativo de Qwen de 7.680 dimensiones, con atencion de rango 32 y un residual de modo edicion entrenado. Se conservan el encoder Qwen nativo completo y las capas ocultas 9/18/27.

El modulo de grounding de instrucciones procesa caracteristicas del transformer de 3.072 dimensiones derivadas solo de la fuente, junto con parches RGB, y aplica atencion cruzada contra la instruccion codificada por separado. Una red transformer espacial produce una rejilla de probabilidad de edicion de 32 × 32, con umbral de mascara seleccionado por validacion en 0,4. Las caracteristicas de la fuente para grounding usan el prompt generico fijo "Describe the visible scene."; la instruccion original entra por la cabeza de atencion cruzada separada. El contexto de inferencia es de 256 tokens, la condicion negativa vacia se codifica de forma nativa y el calendario de flujo usa el shift empirico nativo. El tiempo de posicion de la imagen de referencia es 10 y las caracteristicas solo-fuente usan 0.

El adaptador se entreno sobre el dataset osunlp/MagicBrush. La validacion reportada compara las redes auxiliares MLX contra los pesos PyTorch originales en un Apple M4: error absoluto maximo de 0,00003911 en los logits del grounder de instrucciones y de 0,000000238 en el puente semantico, con pruebas FP32 sobre 1.024 tokens de fuente, lotes de uno y dos, y 29/64 tokens de texto con mascaras de padding. Los 120 tensores LoRA se mapearon a las 60 capas esperadas y los IDs de plantilla de instruccion y mascaras de padding coincidieron exactamente. No se documenta en la informacion disponible el numero total de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Edicion de imagen guiada por instrucciones en lenguaje natural a partir de una imagen fuente y un prompt textual.
- Grounding espacial: prediccion de una region de edicion sobre una rejilla de 32 × 32 con probabilidades por celda.
- Generacion de mascara predicha y mapa de probabilidad de grounding como artefactos de salida.
- Restriccion opcional de latentes durante el denoising para preservar la trayectoria fuente/ruido fuera de la region predicha (`--constrain-predicted-region`).
- Composicion por copia de pixeles fuera de la mascara predicha (`--protect-predicted-region`), que genera una imagen protegida separada de la salida cruda del modelo.
- Salida de metadatos en JSON con prompt, semilla, procedencia de pesos, hashes y ajustes de ejecucion.
- Control de semilla, pasos de muestreo y escala de guidance.
- Soporte de instrucciones en ingles unicamente.
- No incluye modelo de chat, capacidades de texto generativo, audio, video ni generacion de documentos.

## Casos de uso

- Edicion localizada de objetos en imagenes: dado un prompt como "Put a butterfly on the dog.", el modelo predice la region del perro y aplica la edicion solo ahi, lo que resulta util para retoque semiautomatico en flujos de diseno grafico donde se quiere evitar que el resto de la imagen cambie.
- Prototipado de herramientas de edicion asistida en Mac: al ejecutarse sobre MLX en Apple Silicon con un M4 de 24 GB como maquina de prueba, sirve para validar interfaces de edicion por instruccion en entornos de desarrollo locales sin GPU dedicada.
- Investigacion en grounding de instrucciones visuales: la salida de rejilla 32 × 32 y el mapa de probabilidad permiten analizar como el modelo asocia fragmentos de la instruccion con regiones de la imagen, util para estudiar alineamiento instruccion-region.
- Generacion de mascaras de edicion para pipelines posteriores: la mascara predicha y el JSON de metadatos pueden alimentar herramientas de inpainting o composicion externas que necesiten una region de interes delimitada.
- Evaluacion comparativa de adaptadores LoRA sobre difusion: al mantener el LoRA como residuo sin hornear sobre la base 4-bit, permite experimentar con sustitucion o apilado de adaptadores en investigacion sobre edicion de imagen.
- Pruebas de reproducibilidad y paridad numerica: los artefactos de validacion (errores maximos documentados, mapeo de tensores, manejo de instrucciones) sirven como referencia para portar redes auxiliares de PyTorch a MLX en otros proyectos.
- Demostraciones educativas de edicion por instruccion en entornos academicos, dado su caracter experimental y su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de edicion (como FID, CLIP-score o metricas de adherencia a instruccion) en la informacion disponible. Los unicos datos numericos reportados son de paridad numerica entre la implementacion MLX y los pesos PyTorch originales:

| Componente | Error absoluto maximo |
|---|---:|
| Logits del instruction-grounder | 0,00003911 |
| Puente semantico | 0,000000238 |

Condiciones de la prueba: FP32, 1.024 tokens de fuente, lotes de uno y dos, 29/64 tokens de texto con mascaras de padding, sobre Apple M4. Los resultados completos se encuentran en `evaluation/component_parity.json`, `evaluation/lora_mapping.json` y `evaluation/instruction_handling.json`.

## Requisitos de hardware

- VRAM/espacio: el checkpoint base 4-bit ocupa aproximadamente 4,6 GB en disco y se descarga en el primer arranque; el bundle del adaptador es de unos 45 MB. No se especifica el consumo de memoria unificado en ejecucion.
- GPU: requiere un Mac con Apple Silicon y acceso a Metal. La maquina de prueba local del autor es un M4 con 24 GB de memoria unificada.
- Modelos con menos memoria: no validados segun la model card.
- Software: Python 3.12 o superior, `huggingface_hub>=1,<2`, el paquete `mflux` y la CLI `horizon-edit` incluida en el bundle.
- Despliegue: no compatible con `mlx_lm.load`, `AutoModel` de Transformers ni pipelines estandar de Diffusers; debe usarse el runtime propio del bundle.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto instruccion | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Horizon 1 | 4B base + adaptador ~45 MB | 256 tokens | Edicion localizada con grounding sobre FLUX.2 Klein, MLX | apache-2.0 | HuggingFace (saggamer/horizon-1) |
| FLUX.2 Klein base 4B | 4B | no disponible | Difusion texto/imagen base sin adaptador de edicion | no disponible en la informacion | HuggingFace (black-forest-labs/FLUX.2-klein-base-4B) |
| FLUX2-klein-base-4B-mlx-4bit | 4B | no disponible | Conversion comunitaria 4-bit MLX del anterior | no disponible en la informacion | HuggingFace (AITRADER/FLUX2-klein-base-4B-mlx-4bit) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. Horizon 1 se distingue por anadir grounding espacial y edicion por instruccion sobre la base, mientras que los otros dos son checkpoints base sin esa capa de edicion.

## Limitaciones y advertencias

- Release de investigacion: el autor declara explicitamente que no es un editor listo para produccion ni una afirmacion de estado del arte.
- Adherencia a instrucciones sobre fotografias reales limitada, segun la propia model card.
- Solo soporta ingles; no hay capacidades multilingues.
- Contexto de instruccion de 256 tokens: las instrucciones que exceden ese presupuesto se rechazan en lugar de truncarse silenciosamente.
- La imagen fuente se convierte a RGB y se redimensiona a 512 × 512, lo que limita la resolucion de trabajo.
- La composicion `--protect-predicted-region` es una copia de pixeles fuera de la mascara y no puede corregir una region predicha incorrecta; no es evidencia de que la edicion solicitada haya tenido exito.
- El checkpoint base comunitario no ha sido reproducido de forma independiente por el autor; `--base-path` registra una anulacion pero no establece la identidad del checkpoint.
- No debe sustituirse el modelo Klein 4B destilado por el modelo base.
- Riesgo de alucinacion visual y de ediciones fuera de la region solicitada cuando el grounding falla.
- No validado en Macs con menos de 24 GB de memoria unificada.
- Incompatible con cargadores estandar (`mlx_lm.load`, `AutoModel`, Diffusers), lo que restringe su integracion en pipelines convencionales.
- Sesgos: no se documentan sesgos especificos en la informacion disponible; al derivar de FLUX.2 y entrenarse sobre MagicBrush, puede heredar sesgos de esos recursos.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del checkpoint base FLUX.2 Klein antes de uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saggamer/horizon-1
- Checkpoint base FLUX.2 Klein 4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B
- Conversion MLX 4-bit del base: https://huggingface.co/AITRADER/FLUX2-klein-base-4B-mlx-4bit
- Dataset de entrenamiento: https://huggingface.co/datasets/osunlp/MagicBrush
- Artefactos de evaluacion en el repo: `evaluation/component_parity.json`, `evaluation/lora_mapping.json`, `evaluation/instruction_handling.json`
