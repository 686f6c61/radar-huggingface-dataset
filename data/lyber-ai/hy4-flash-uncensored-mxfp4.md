# lyber-ai/Hy4-flash-UNCENSORED-MXFP4

## Resumen

Hy4-flash-UNCENSORED-MXFP4 es una versión afinada y sin censura (uncensored) del modelo Tencent Hy4-flash, publicada por el usuario lyber-ai en Hugging Face. Se distribuye en formato MXFP4 mediante la librería compressed-tensors y la librería transformers, con pesos en safetensors y un tamaño de repositorio de 155,6 GB. El modelo base es tencent/Hy4-flash, un transformer de tipo Mixture of Experts (MoE) de la familia Hunyuan, según indican las etiquetas del repositorio.

La ficha se enfrenta a una limitación importante: la información proporcionada se reduce a los metadatos de Hugging Face. No hay datos publicados sobre número de parámetros, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks, por lo que muchos campos se marcan como "no disponible". El modelo está etiquetado para generación de texto, razonamiento y tool calling, y declara soporte para siete idiomas: inglés, chino, español, francés, japonés, coreano y ruso.

Su relevancia ahora es doble: por un lado, es una de las primeras muestras públicas de despliegue de un modelo Hunyuan de gran tamaño en cuantización MXFP4, un formato de 4 bits con escala compartida por bloques pensado para aceleradores modernos; por otro, la variante "uncensored" elimina las restricciones de alineación del modelo original, lo que interesa a investigadores que estudian comportamiento sin filtros, pero plantea riesgos claros para uso en producción. El acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Mixture of Experts (MoE), familia Hunyuan (etiqueta `moe`, `hy_v4_flash`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo base es MoE según las etiquetas) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (4 bits, formato de coma flotante microscalado), mediante compressed-tensors |
| Idiomas soportados | en, zh, es, fr, ja, ko, ru |
| Licencia | tencent-hunyuan (licencia "other" en Hugging Face) |
| Formato de pesos | safetensors (cuantizado MXFP4, compressed-tensors) |

## Arquitectura y entrenamiento

El modelo se basa en Tencent Hy4-flash, un transformer de tipo Mixture of Experts según las etiquetas del repositorio (`moe`, `hy_v4_flash`, `tencent`, `hunyuan`). La variante publicada por lyber-ai es un fine-tune del modelo base, tal y como indica la etiqueta `base_model:finetune:tencent/Hy4-flash`, orientado a eliminar la censura y las restricciones de alineación del modelo original. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset de ajuste fino, ni si se emplearon técnicas de RLHF o DPO en el proceso.

La innovación técnica destacable es la cuantización MXFP4 con compressed-tensors: un formato de 4 bits con exponente compartido por bloques que reduce el peso del repositorio a 155,6 GB y permite servir el modelo en hardware con soporte para tipos microscalados (GPU Blackwell y posteriores, o kernels específicos). No hay información disponible sobre decodificación especulativa, atención lineal ni otras optimizaciones de inferencia en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational`.
- Razonamiento explícito: el repositorio incluye la etiqueta `reasoning`, lo que sugiere modo de pensamiento o cadenas de razonamiento extendidas.
- Tool calling / function calling: etiqueta `tool-calling` presente en el repositorio.
- Soporte multilingüe declarado para inglés, chino, español, francés, japonés, coreano y ruso.
- Comportamiento sin censura: el fine-tune elimina los filtros de rechazo y las restricciones de alineación del modelo base, lo que permite respuestas sin las negativas típicas de los modelos alineados.
- Compatibilidad con endpoints: etiqueta `endpoints_compatible`, lo que indica que puede desplegarse en la infraestructura de Inference Endpoints de Hugging Face.
- No hay información disponible sobre capacidades de visión, audio o multimodalidad.

## Casos de uso

- Investigación sobre alineación y censura: el modelo permite estudiar cómo varía el comportamiento de un mismo modelo base antes y después de eliminar las restricciones de alineación, comparando respuestas en dominios sensibles con la versión original de Tencent.
- Evaluación de cuantización MXFP4: sirve como banco de pruebas para medir la degradación de calidad de un MoE de gran tamaño al pasar a 4 bits con compressed-tensors, comparando perplejidad y benchmarks contra el modelo en precisión completa.
- Generación de código y tool calling en pipelines internos: gracias a la etiqueta `tool-calling`, puede integrarse en agentes que invocan APIs y ejecutan pasos multi-etapa, siempre en entornos controlados y con revisión humana.
- Atención al cliente en varios idiomas: el soporte declarado de siete idiomas permite construir asistentes conversacionales multi-turno para mercados europeos y asiáticos, con la salvedad de que la ausencia de censura exige filtros propios en la capa de aplicación.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o narrativa que aborde temas que los modelos alineados rechazan, con revisión editorial posterior.
- Despliegue en infraestructura con aceleradores modernos: el formato MXFP4 está pensado para GPU con soporte de tipos microscalados, lo que permite servir el modelo con menor huella de memoria que una versión en BF16 en clústeres con Blackwell o kernels compatibles.
- Análisis de documentos y resumen en contexto largo: si el modelo base conserva una ventana de contexto amplia (no confirmada en la información disponible), podría emplearse para resumir y extraer información de documentación técnica multilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 155,6 GB en MXFP4. Para inferencia se necesita al menos esa cifra de memoria agregada, más overhead de activaciones y caché KV; una estimación conservadora sitúa el mínimo en torno a 160-180 GB.
- GPU recomendadas: al menos dos A100 de 80 GB o dos H100 de 80 GB para cubrir los pesos; una sola H100 de 80 GB no es suficiente por el tamaño del repositorio.
- GPU con soporte nativo de MXFP4: las Blackwell (B200, GB200) incluyen soporte hardware para tipos microscalados, lo que reduce el coste de desempaquetado frente a generaciones anteriores.
- GPU de consumo: no cabe en ninguna GPU de consumo actual (RTX 4090 con 24 GB, RTX 5090 con 32 GB) sin offloading a memoria del sistema, lo que degradaría gravemente el throughput.
- Opciones de despliegue: transformers con compressed-tensors es la vía documentada por las etiquetas; vLLM, TGI y llama.cpp no están confirmados para este formato en la información disponible. La etiqueta `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lyber-ai/Hy4-flash-UNCENSORED-MXFP4 | no disponible (MoE) | no disponible | MXFP4 | tencent-hunyuan | Gated en Hugging Face |
| tencent/Hy4-flash (base) | no disponible (MoE) | no disponible | BF16 y otras | tencent-hunyuan | Hugging Face (Tencent) |
| Otras variantes uncensored de la familia Hunyuan | no disponible | no disponible | variable | variable | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas del modelo base en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Ausencia de censura: el fine-tune elimina los filtros de rechazo del modelo original, por lo que puede generar contenido dañino, ilegal o sexualmente explícito. No es apto para aplicaciones de cara al público sin una capa de moderación propia.
- Sesgos conocidos: no hay información publicada sobre la evaluación de sesgos de esta variante; al eliminar la alineación, es esperable que los sesgos del dataset de preentrenamiento afloren con menos contención.
- Riesgo de alucinación: no cuantificado en la información disponible; los modelos de razonamiento sin alineación pueden presentar confianza excesiva en afirmaciones incorrectas.
- Licencia: la licencia tencent-hunyuan puede imponer restricciones al uso comercial y a la redistribución; es obligatorio revisar sus términos antes de cualquier despliegue en producción. El acceso gated añade un requisito adicional de aceptación de condiciones.
- Idiomas: el soporte declarado cubre siete idiomas, pero no hay evaluación publicada de calidad por idioma; el español y el francés pueden tener un rendimiento inferior al inglés y al chino.
- Formato MXFP4: requiere kernels y versiones de librerías compatibles con compressed-tensors; la compatibilidad con servidores de inferencia populares no está confirmada.
- Tamaño: 155,6 GB de pesos implican un coste de despliegue elevado y excluyen el uso en hardware de consumo.
- Riesgo reputacional y legal: usar un modelo uncensored en productos comerciales puede violar las políticas de los proveedores de infraestructura y las normativas locales sobre contenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lyber-ai/Hy4-flash-UNCENSORED-MXFP4
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Perfil del autor: https://huggingface.co/lyber-ai
- Librería compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Documentación de transformers: https://huggingface.co/docs/transformers
