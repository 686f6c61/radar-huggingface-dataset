# mradermacher/Luminous-Mirror-26B-A4B-GGUF

## Resumen

Luminous-Mirror-26B-A4B-GGUF es la versión cuantizada en formato GGUF del modelo Luminous-Mirror-26B-A4B, desarrollado por Vortex5 y cuantizado por mradermacher. Se trata de un modelo de lenguaje de gran tamaño orientado a roleplay y narración de historias, construido mediante merge de varios modelos con la herramienta mergekit. El nombre del modelo indica una arquitectura de mezcla de expertos (MoE) con aproximadamente 26 mil millones de parámetros totales y 4 mil millones activos por token, aunque el recuento exacto de safetensors es de 25.233.142.046 parámetros. Incluye además un proyector multimodal (mmproj) que sugiere capacidades de visión, aunque no se detallan en la documentación.

La relevancia de esta ficha radica en que ofrece a desarrolladores e investigadores una opción de modelo de roleplay con licencia Apache 2.0, ejecutable localmente en hardware de consumo gracias a las cuantizaciones GGUF. El modelo está pensado para aplicaciones conversacionales y creativas, con soporte para inglés únicamente. Al ser un merge, hereda características de los modelos originales, pero no se dispone de información detallada sobre su entrenamiento o arquitectura interna más allá de lo indicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con proyector multimodal (mmproj); merge de modelos mediante mergekit |
| Parametros totales | 25.233.142.046 (aprox. 25,2B) |
| Parametros activos | 4B (según nomenclatura "A4B") |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; además mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. El nombre "26B-A4B" sugiere una arquitectura de mezcla de expertos (MoE) con 26 mil millones de parámetros totales y 4 mil millones activos por token, similar a otros modelos recientes como Gemma 4 26B-A4B, pero no se confirma que Luminous-Mirror derive de esa familia. El modelo fue construido mediante merge de varios modelos usando mergekit, una herramienta que combina pesos de distintos modelos para obtener capacidades híbridas. Además, el repositorio incluye archivos mmproj (proyector multimodal), lo que indica que el modelo puede procesar entradas visuales, aunque no se especifican los detalles del proyector ni el dataset de entrenamiento.

No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras. Al ser un merge, el modelo hereda el conocimiento y las limitaciones de sus modelos base, que no se enumeran en la documentación.

## Capacidades

- Generación de texto en inglés, especialmente optimizado para roleplay y storytelling.
- Capacidades multimodales básicas gracias al proyector mmproj (se requiere el archivo mmproj correspondiente).
- Soporte de conversaciones multi-turno, típico en modelos de chat, aunque no se confirma explícitamente.
- No se indica soporte de tool calling, function calling ni razonamiento multi-paso específico.
- El modelo está etiquetado como "conversational" y "roleplay", lo que sugiere un buen desempeño en diálogos creativos y narración.
- No se especifican capacidades multilingües más allá del inglés.

## Casos de uso

- Roleplay interactivo: el modelo puede mantener personajes y tramas en conversaciones largas, ideal para juegos de rol escritos o asistentes narrativos.
- Escritura creativa asistida: generar historias, diálogos y descripciones con un tono consistente, aprovechando su entrenamiento en storytelling.
- Creación de personajes virtuales: construir avatares conversacionales con personalidad definida para aplicaciones de entretenimiento o educación.
- Prototipado rápido de chatbots narrativos: gracias a su licencia Apache 2.0 y formato GGUF, puede integrarse en entornos de desarrollo locales sin coste de API.
- Análisis de contenido multimodal: si se usa el proyector, puede procesar imágenes junto con texto para descripciones o narrativas basadas en ellas.
- Experimentación académica: investigadores pueden estudiar el comportamiento de modelos merge en tareas de generación creativa y compararlo con otros modelos de tamaño similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo. Se recomienda realizar evaluaciones propias si se considera su uso en aplicaciones críticas.

## Requisitos de hardware

- VRAM estimada: según el quants, desde 10,7 GB (Q2_K) hasta 27,0 GB (Q8_0). El Q4_K_M (16,9 GB) es un equilibrio razonable entre calidad y requisitos.
- GPU recomendadas: para Q4_K_M o Q5_K_M, una GPU con 16-20 GB de VRAM (por ejemplo, RTX 4080/4090, A4000, etc.). Para Q8_0 se necesitan 24 GB o más (RTX 4090, A5000, etc.).
- En CPU: se puede ejecutar con llama.cpp, pero la velocidad será limitada; se recomienda al menos 32 GB de RAM para los quants más grandes.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-webui, LM Studio, o cualquier frontend compatible con GGUF.
- Latencia y throughput: no disponibles. Dependerá del hardware y del quants elegido.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El nombre del modelo sugiere una arquitectura similar a google/gemma-4-26B-A4B-it, que también tiene 26B totales y 4B activos, pero no hay datos que confirmen que Luminous-Mirror derive de esa familia. No se conocen modelos directamente comparables en cuanto a rendimiento, licencia y orientación a roleplay con el mismo tamaño y formato GGUF.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un modelo de roleplay, puede generar contenido inapropiado, ofensivo o sexualmente explícito. Se recomienda supervisión humana y filtros de contenido en aplicaciones públicas.
- Riesgo de alucinación: como todo LLM, puede inventar información o hechos, especialmente en contextos creativos.
- Limitaciones de idioma: solo inglés, no soporta otros idiomas de forma fiable.
- Longitud de contexto no especificada: se desconoce el límite de tokens de entrada, lo que puede afectar a tareas que requieran contexto largo.
- Al ser un merge, no se garantiza la coherencia interna ni la estabilidad en todos los dominios.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que los modelos base también tengan licencias compatibles (no se listan en la documentación).
- Los archivos mmproj son complementos multimodales; si no se usan, el modelo se comporta como un LLM de texto puro.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Luminous-Mirror-26B-A4B-GGUF
- Modelo base: https://huggingface.co/Vortex5/Luminous-Mirror-26B-A4B
- Perfil de mradermacher: https://huggingface.co/mradermacher
- Página de solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
