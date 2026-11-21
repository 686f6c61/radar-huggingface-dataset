# mradermacher/EliasAI-Micro-i1-GGUF

## Resumen

EliasAI-Micro-i1-GGUF es una colección de cuantizaciones en formato GGUF del modelo EliasAI-Micro, publicada por el usuario mradermacher, conocido en Hugging Face por distribuir versiones cuantizadas de modelos de terceros. El modelo original procede de ETME-TECH/EliasAI-Micro, pero no se dispone de información publicada sobre su arquitectura, datos de entrenamiento o propósito en la documentación accesible.

El dato técnico más relevante es el recuento de parámetros real declarado en safetensors: 481.182 parámetros totales. Se trata, por tanto, de un modelo extremadamente pequeño, varios órdenes de magnitud por debajo de los modelos de lenguaje convencionales, lo que sugiere un uso experimental, educativo o de demostración más que un despliegue en producción.

La model card del repositorio es prácticamente vacía: solo incluye metadatos internos del proceso de cuantización (versión de quantize_version, tipo de conversión hf, lista de cuantizaciones generadas) y la referencia al modelo base. No hay información sobre licencia, idiomas, contexto ni benchmarks, por lo que esta ficha se limita a documentar lo verificable y marca el resto como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 481.182 (según safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small-IQ4_NL), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo base EliasAI-Micro en la documentación disponible. El recuento de 481.182 parámetros totales es incompatible con un transformer de lenguaje convencional y apunta a un modelo de escala muy reducida, posiblemente experimental o de juguete, aunque no se puede confirmar sin acceso a la model card del repositorio original.

Respecto al proceso de cuantización, los metadatos indican que se han generado cuantizaciones ponderadas con imatrix (`weighted/imatrix quants`) y que la conversión se realizó con `convert_type: hf` y `quantize_version: 2`, lo que corresponde al flujo estándar de llama.cpp para producir GGUF a partir de pesos en formato Hugging Face. No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF, DPO).

## Capacidades

- No se dispone de información publicada sobre las capacidades del modelo (generación de texto, razonamiento, código, matemáticas, visión, etc.).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües ni idiomas cubiertos.
- No se documentan modos especiales (thinking mode, visión, audio).
- El único dato operativo es que existen pesos GGUF en múltiples niveles de cuantización, lo que permite su uso con llama.cpp y herramientas compatibles.

## Casos de uso

- Evaluación de pipelines de cuantización: el repositorio sirve como ejemplo práctico de cómo mradermacher genera cuantizaciones ponderadas con imatrix a partir de un modelo en safetensors, útil para quien quiera replicar el flujo con llama.cpp.
- Pruebas de integración con llama.cpp: al ser un GGUF de tamaño mínimo, permite validar la carga de modelos, la tokenización y la inferencia en entornos de test sin consumir recursos significativos.
- Docencia y demostración de cuantización: útil para explicar las diferencias entre Q2_K, IQ2_XXS, Q4_K_M, Q6_K e IQ1_S en términos de tamaño y fidelidad, usando un modelo pequeño como banco de pruebas.
- Experimentación con despliegues ligeros: sirve para probar contenedores, scripts de arranque y configuraciones de servidores de inferencia (llama.cpp server, Ollama) antes de escalar a modelos mayores.
- Investigación sobre modelos de muy baja escala: el recuento de 481.182 parámetros permite estudiar el comportamiento de arquitecturas minúsculas y su cuantización agresiva (IQ1_S, IQ2_XXS).
- Verificación de compatibilidad de herramientas: útil para comprobar que una versión concreta de llama.cpp o de un cliente GGUF soporta los formatos IQ1/IQ2/IQ3 generados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 481.182 parámetros, el modelo ocupa del orden de kilobytes a pocos megabytes según la cuantización (por ejemplo, Q4_K_M rondaría unos 0,3 MB de pesos, aunque el tamaño exacto del repo figura como 0,0 GB en Hugging Face).
- GPU recomendadas: cualquier GPU, incluida una iGPU o CPU, es suficiente; no requiere VRAM dedicada significativa.
- Cabe en cualquier GPU consumer, incluso en modelos antiguos o en sistemas embebidos, y también funciona en CPU.
- Opciones de despliegue: llama.cpp (nativo), Ollama (si se empaqueta como Modelfile), servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma estándar para este caso.
- Latencia y throughput: no disponibles; por el tamaño, la latencia sería despreciable en cualquier hardware moderno, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (mismo tamaño o misma tarea) con datos verificables de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no hay información sobre entrenamiento, datos, sesgos ni evaluación, lo que impide valorar su calidad o seguridad.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; debe consultarse el repositorio original ETME-TECH/EliasAI-Micro antes de cualquier despliegue.
- Riesgo elevado de alucinación y comportamiento impredecible: con 481.182 parámetros, la capacidad de generar texto coherente es muy limitada en el mejor de los casos.
- Idiomas no documentados: no se puede asumir soporte de castellano ni de ningún otro idioma.
- Contexto no documentado: se desconoce la ventana máxima; no debe asumirse un contexto largo.
- Cuantizaciones muy agresivas (IQ1_S, IQ1_M, IQ2_XXS) degradan aún más la fidelidad; para cualquier evaluación seria conviene usar Q6_K o Q4_K_M.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación por terceros.
- No apto para producción: sin benchmarks, licencia clara ni documentación, no debería emplearse en sistemas reales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/EliasAI-Micro-i1-GGUF
- Modelo base: https://huggingface.co/ETME-TECH/EliasAI-Micro
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
