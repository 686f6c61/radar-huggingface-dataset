# Mike0095/xenia-woman

## Resumen

Mike0095/xenia-woman es un adaptador LoRA (Low-Rank Adaptation) entrenado con la técnica DreamBooth sobre el modelo base Krea 2 de Krea, concretamente sobre el checkpoint RAW, diseñado para generar imágenes de una mujer con el estilo asociado al prompt `xenia woman`. El modelo está publicado en Hugging Face por el usuario Mike0095 y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación sin restricciones adicionales.

El adaptador está pensado para ser utilizado con el pipeline de diffusers de Krea 2, cargando los pesos del LoRA sobre el checkpoint Turbo (la versión destilada para inferencia rápida). Según la documentación, los LoRA entrenados sobre RAW expresan bien sobre Turbo, lo que permite generar imágenes en 8 pasos sin guidance. El repositorio tiene un tamaño de 0.8 GB, correspondiente a los pesos del adaptador en formato safetensors.

La relevancia de este modelo reside en su naturaleza de personalización: permite a cualquier desarrollador o usuario generar imágenes de un personaje concreto (en este caso, una mujer denominada "xenia") de forma consistente, sin necesidad de entrenar un modelo completo. Es un ejemplo de adaptación eficiente mediante LoRA dentro del ecosistema de difusión de Krea 2, que ofrece dos checkpoints (RAW y Turbo) para separar el entrenamiento de la inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre Krea 2, modelo de difusion texto a imagen |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica, es generacion de imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado mediante DreamBooth sobre el checkpoint RAW de Krea 2, que es la versión no destilada del modelo base de difusión. Krea 2 se distribuye en dos variantes: RAW (para fine-tuning) y Turbo (una versión destilada que permite inferencia en 8 pasos sin classifier-free guidance). Según la documentación del autor, los LoRA entrenados en RAW se expresan correctamente al cargarlos sobre Turbo, lo que facilita el flujo de trabajo: entrenar en RAW, inferir en Turbo.

El entrenamiento se realizó con el script de ejemplo de diffusers para Krea 2 (disponible en el repositorio oficial de Hugging Face). No se proporcionan detalles sobre el dataset utilizado, el número de imágenes, el número de pasos de entrenamiento, ni el rango del LoRA. Tampoco se menciona el uso de RLHF, DPO u otras técnicas de alineación. La model card indica que los pesos son de DreamBooth LoRA, pero no especifica hiperparámetros adicionales.

## Capacidades

- Generación de imágenes a partir del prompt desencadenante `xenia woman`, produciendo representaciones visuales de un personaje femenino consistente con el estilo aprendido durante el entrenamiento.
- Adaptación ligera sobre el modelo base Krea 2, lo que permite combinar este LoRA con otros adaptadores o ajustar su peso de fusión (merge) para variar el estilo.
- Compatibilidad con el pipeline `Krea2Pipeline` de la librería diffusers, permitiendo su uso en entornos Python con PyTorch y GPU.
- Inferencia rápida al combinarse con el checkpoint Turbo (8 pasos, guidance scale 0.0), reduciendo el coste computacional frente a modelos de difusión estándar.
- No se han documentado capacidades como tool calling, razonamiento multi-step, procesamiento de lenguaje o visión más allá de la generación de imágenes.

## Casos de uso

- Creación de avatares personalizados: el LoRA permite generar retratos de un personaje femenino específico (xenia) con distintas poses, fondos o iluminación, ideal para perfiles de redes sociales, foros o mundos virtuales.
- Diseño de personajes para narrativa visual: escritores o ilustradores pueden usar el modelo para mantener la consistencia visual de un personaje en múltiples ilustraciones de un cómic, novela gráfica o guion gráfico.
- Prototipado de conceptos de moda: al entrenar el LoRA sobre imágenes de una modelo o estilo concreto, se pueden generar variaciones de atuendos, accesorios o escenarios para moodboards de diseño.
- Generación de contenido para marketing: agencias pueden producir imágenes de una "embajadora" ficticia o modelo virtual para campañas publicitarias, manteniendo una identidad visual uniforme.
- Experimentación artística: artistas digitales pueden fusionar este LoRA con otros adaptadores o modificar su peso para explorar estilos híbridos sin reentrenar el modelo completo.
- Educación y demostración técnica: sirve como ejemplo práctico de fine-tuning con DreamBooth y LoRA sobre un modelo de difusión moderno, útil para cursos o talleres sobre generación de imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas objetivas (como FID, CLIP score o comparaciones con otros adaptadores) en la model card ni en las búsquedas web realizadas.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la documentación del modelo. Al ser un LoRA, los requisitos dependen del modelo base Krea 2 Turbo, cuyas especificaciones no se han proporcionado.
- Se recomienda al menos una GPU con soporte para PyTorch y CUDA, dado que el ejemplo de uso utiliza `torch_dtype=torch.bfloat16` y `.to("cuda")`.
- Para la inferencia en 8 pasos, es probable que una GPU de consumo como una RTX 3060 o superior sea suficiente, pero este dato no está confirmado.
- Las opciones de despliegue incluyen la librería diffusers con el pipeline `Krea2Pipeline`. No se mencionan otras herramientas como vLLM, llama.cpp u Ollama, que son específicas para modelos de lenguaje.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han encontrado adaptadores LoRA comparables para Krea 2 en la información proporcionada, ni modelos equivalentes de otros autores que permitan una comparación objetiva.

## Limitaciones y advertencias

- La model card no documenta sesgos específicos, pero al tratarse de un modelo entrenado con datos no revelados, puede presentar sesgos de género, etnia o estilo derivados del dataset de entrenamiento.
- No se garantiza que las imágenes generadas sean fieles a un personaje real o ficticio concreto; el resultado depende del prompt y del entrenamiento, con riesgo de alucinaciones visuales o variaciones no deseadas.
- El modelo solo genera imágenes; no posee capacidades de lenguaje natural, razonamiento o interacción conversacional.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrecen garantías sobre la calidad, seguridad o legalidad del contenido generado. El usuario es responsable de cumplir con normativas locales sobre contenido generado por IA.
- No se proporcionan detalles sobre el dataset de entrenamiento, por lo que no es posible evaluar la procedencia de las imágenes ni posibles problemas de derechos de autor.
- El uso del modelo requiere cargar el checkpoint base Krea 2 Turbo, que tiene su propia licencia y términos de uso; estos no se detallan en la ficha del adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mike0095/xenia-woman
- Documentación de carga de LoRA en diffusers: https://huggingface.co/docs/diffusers/main/en/using-diffusers/loading_adapters
- Script de entrenamiento DreamBooth para Krea 2 (referenciado en la model card): https://github.com/huggingface/diffusers/blob/main/examples/dreambooth/README_krea2.md
