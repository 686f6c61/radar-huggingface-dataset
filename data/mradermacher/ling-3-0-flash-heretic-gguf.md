# mradermacher/Ling-3.0-flash-heretic-GGUF

## Resumen

Ling-3.0-flash-heretic-GGUF es una colección de cuantizaciones GGUF del modelo Ling-3.0-flash-heretic, una versión "abliterada" (modificada para eliminar respuestas de rechazo y censura) del modelo Ling-3.0-flash desarrollado por InclusionAI. El trabajo de cuantización lo realiza mradermacher, un reconocido especialista en la generación de pesos GGUF para ejecución local eficiente.

El modelo base Ling-3.0-flash es un modelo de razonamiento híbrido de arquitectura MoE (Mixture of Experts) con 124 000 millones de parámetros totales y 5 100 millones activos por token. Destaca por su ventana de contexto nativa de 256 000 tokens, ampliable hasta 1 millón, y está orientado a tareas de generación de código, investigación profunda, seguimiento de instrucciones y flujos de trabajo agénticos. La variante heretic elimina los rechazos de contenido, lo que la hace atractiva para usuarios que buscan un modelo sin restricciones en entornos locales.

La relevancia de este repositorio reside en que ofrece pesos cuantizados listos para usar con herramientas como llama.cpp, Ollama o LocalAI, cubriendo un espectro que va desde 46,6 GB (Q2_K) hasta 135,7 GB (Q8_0), lo que permite desplegarlo en configuraciones de hardware muy diversas. La licencia MIT facilita su uso tanto en investigación como en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) hibrida de razonamiento |
| Parametros totales | 127 486 405 600 (aprox. 124 B segun InclusionAI) |
| Parametros activos | 5 500 millones (5,1 B segun InclusionAI) |
| Longitud de contexto | 256 000 tokens nativos, ampliable a 1 000 000 |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_S, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (etiqueta "en" en el modelo base) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

Ling-3.0-flash es un modelo de razonamiento híbrido que combina mecanismos de atención densa con capas de mezcla de expertos (MoE), lo que le permite activar solo una fracción de sus parámetros por token (5,1 de 124 mil millones) para mantener una alta eficiencia computacional. La arquitectura está diseñada para razonamiento multi-paso, seguimiento de instrucciones complejas y flujos de trabajo agénticos, con una ventana de contexto nativa de 256 000 tokens ampliable a 1 millón.

El modelo base fue entrenado por InclusionAI con datos centrados en código, investigación y conversación, y posteriormente se le aplicó un proceso de "abliteration" (eliminación de la direccionalidad de rechazo) para crear la variante heretic, que responde sin las restricciones de seguridad habituales. Este proceso modifica los pesos del modelo para reducir la probabilidad de negarse a responder a determinadas solicitudes. La cuantización a GGUF realizada por mradermacher no altera el comportamiento del modelo, solo reduce el tamaño de los pesos mediante técnicas de cuantización estándar (Q2_K, Q3_K_M, Q4_K_S, Q6_K, Q8_0).

## Capacidades

- Generacion de texto y conversacion multi-turno con contexto largo (256 K tokens nativos, ampliable a 1 M).
- Razonamiento paso a paso y resolución de problemas complejos, gracias a su arquitectura híbrida de reflexo.
- Generacion de codigo en múltiples lenguajes, con soporte para funciones de llamada (function calling) y herramientas.
- Seguimiento de instrucciones detalladas y tareas de investigación profunda (deep research).
- Soporte de agentes y razonamiento multi-paso para orquestar flujos de trabajo complejos.
- Capacidades multilingues, aunque la variante heretic está etiquetada principalmente como inglesa.
- Ausencia de rechazos (uncensored): responde sin negarse a solicitudes que otros modelos rechazan por políticas de seguridad.

## Casos de uso

- **Asistentes de codigo en entornos de desarrollo**: el modelo puede integrarse en IDE o pipelines de CI/CD para generar código, revisar cambios y sugerir refactorizaciones, aprovechando su ventana de contexto de 256 K tokens para procesar repositorios completos.
- **Investigacion y analisis de documentos largos**: con su contexto ampliable a 1 M de tokens, es adecuado para resumir libros, informes financieros o conjuntos de papers, extrayendo conclusiones de documentos extensos sin perder información.
- **Agentes autonomos**: su soporte para razonamiento multi-paso y function calling permite construir agentes que planifican tareas, llaman a APIs y ejecutan secuencias de acciones con un modelo de razonamiento.
- **Chat de atencion al cliente sin restricciones**: la variante heretic puede manejar conversaciones abiertas sin rechazos, útil para entornos de prueba o aplicaciones que requieren respuestas sin filtros de contenido.
- **Generacion de contenido creativo**: su falta de censura permite usarlo para escribir narrativa, dialogos o material que modelos estandar podrian rechazar, con una calidad de razonamiento alta.
- **Investigacion sobre alineamiento y seguridad**: la version abliterada es util para estudiar el comportamiento de modelos sin capas de rechazo, analizando sesgos y limitaciones inherentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base (Ling-3.0-flash) ha sido evaluado por InclusionAI en tareas de codigo y razonamiento, pero los datos concretos no se han incluido en esta ficha. No se dispone de comparativas numericas de la version heretic frente a otros modelos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: dependiendo de la cuantizacion, se requiere aproximadamente:
  - Q2_K (46,6 GB): minima, requiere al menos 48 GB de VRAM.
  - Q3_K_M (60,9 GB): requiere 64 GB de VRAM.
  - Q4_K_S (72,5 GB): requiere 80 GB de VRAM.
  - Q6_K (104,9 GB): requiere 112 GB de VRAM.
  - Q8_0 (135,7 GB): requiere 144 GB de VRAM.
- **GPU recomendadas**: no se indica en la informacion. Se recomiendan GPUs con gran VRAM como A100 (80 GB), H100 (80 GB), o configuraciones multi-GPU para cuantizaciones superiores. Para Q4_K_S, una A100 80 GB o 2x RTX 4090 (48 GB totales) son viables.
- **No cabe en GPU de consumo estandar**: las RTX 4090 (24 GB) o similares no pueden cargar este modelo completo, incluso en Q2_K (46 GB). Se requieren soluciones de capa dividida (layer offloading) con CPU o configuraciones multi-GPU.
- **Opciones de despliegue**: llama.cpp (con soporte GGUF), Ollama, LocalAI, vLLM (si se convierte a otros formatos), y herramientas de inferencia que soporten GGUF.
- **Latencia y throughput**: no disponible. Dependera de la cuantizacion, el hardware y el backend utilizado.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo de la variante heretic frente a otros modelos. Sin embargo, por su tamano y arquitectura, se puede comparar con modelos MoE de parametros similares:

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ling-3.0-flash-heretic (GGUF) | 127 B | 5,1 B | 256 K | MIT | GGUF |
| DeepSeek-V3 | 671 B | 37 B | 128 K | MIT | Safetensors/GGUF |
| Qwen3-235B-A22B | 235 B | 22 B | 128 K | Apache 2.0 | Safetensors/GGUF |
| Llama-3.1-405B | 405 B | 405 B (denso) | 128 K | Llama License | Safetensors/GGUF |

La variante heretic se diferencia por su licencia MIT (permisiva), su contexto largo y su naturaleza abliterada. No hay datos de benchmark para comparar rendimiento directamente.

## Limitaciones y advertencias

- **Sesgos de la abliteracion**: el proceso de "abliteracion" puede degradar la calidad de las respuestas en tareas que requieren moderacion, y puede producir contenido ofensivo o peligroso sin filtros.
- **Riesgo de alucinacion**: al ser una version sin censura, puede generar informacion falsa o perjudicial con mayor libertad que los modelos moderados.
- **Idiomas**: la variante esta etiquetada principalmente como inglesa; el rendimiento en otros idiomas no esta garantizado.
- **Licencia MIT**: permite uso comercial sin restricciones, pero el usuario es responsable del uso del contenido generado.
- **Contexto**: aunque el contexto nativo es de 256 K tokens, la ampliacion a 1 M puede requerir hardware adicional y degradar la calidad de la atencion en contextos muy largos.
- **Hardware**: los requisitos de VRAM son altos (minimo 48 GB), lo que excluye la mayoria de GPUs de consumo.
- **No reproducible**: la cuantizacion no incluye los pesos originales en safetensors; el modelo base debe obtenerse del repositorio trohrbaugh/Ling-3.0-flash-heretic.

## Enlaces

- [Repositorio de HuggingFace de la cuantizacion GGUF](https://huggingface.co/mradermacher/Ling-3.0-flash-heretic-GGUF)
- [Modelo base de HuggingFace (trohrbaugh/Ling-3.0-flash-heretic)](https://huggingface.co/trohrbaugh/Ling-3.0-flash-heretic)
- [Documentacion oficial de Ling (InclusionAI)](https://developer.ant-ling.com/en/docs/models/ling/)
- [Lista de modelos de mradermacher](https://huggingface.co/mradermacher/models)
