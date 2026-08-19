# mradermacher/XORTRON-CriminalComputing-EnablementEngine-v0.3-GGUF

## Resumen

XORTRON-CriminalComputing-EnablementEngine-v0.3-GGUF es una versión cuantizada en formato GGUF del modelo de lenguaje de gran tamaño XORTRON-CriminalComputing-EnablementEngine-v0.3, desarrollado originalmente por darkc0de y cuantizado por mradermacher. Con aproximadamente 30,7 mil millones de parámetros, este modelo está diseñado para generación de texto y conversación, y se distribuye bajo licencia Apache 2.0. Los metadatos del repositorio lo etiquetan como "uncensored", "abliterated" y "heretic", lo que indica que ha sido modificado para eliminar restricciones de seguridad y alineación, una característica que lo hace relevante para investigaciones sobre modelos sin censura y para aplicaciones donde se requiere libertad creativa sin filtros.

La cuantización GGUF permite ejecutar el modelo en hardware de consumo y en entornos de inferencia local mediante herramientas como llama.cpp, Ollama o text-generation-inference. Se ofrecen múltiples niveles de cuantización (desde Q2_K hasta Q8_0) y también archivos mmproj para soporte multimodal, aunque no se especifican detalles sobre la arquitectura subyacente ni el contexto de entrenamiento. A pesar de su nombre y de los tags asociados, no se dispone de información oficial sobre su arquitectura, dataset de entrenamiento o rendimiento en benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura del modelo base XORTRON-CriminalComputing-EnablementEngine-v0.3. El repositorio de cuantización no incluye datos sobre el tipo de red (transformer, MoE, etc.), el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación empleadas. Los tags "abliterated" y "uncensored" sugieren que se aplicaron técnicas de eliminación de rechazos o de "des-censura" sobre un modelo preexistente, pero no se especifica el procedimiento exacto. Tampoco se menciona el uso de RLHF, DPO u otros métodos de ajuste fino.

## Capacidades

- Generación de texto libre, sin restricciones temáticas aparentes, según los tags "uncensored" y "heretic".
- Orientación conversacional, indicada por el tag "conversational", lo que sugiere capacidad para mantener diálogos multi-turno.
- Soporte multimodal potencial, gracias a la inclusión de archivos mmproj (proyectores multimodales) en el repositorio, aunque no se detalla qué modalidades (imagen, audio, etc.) están cubiertas.
- No se dispone de información confirmada sobre tool calling, razonamiento multi-paso, capacidades de agente o habilidades específicas en código o matemáticas.

## Casos de uso

- Generación de texto creativo sin filtros: el modelo puede emplearse en proyectos de escritura experimental, narrativa interactiva o creación de contenido donde se requiera explorar temas tabú o controvertidos sin las restricciones habituales de los modelos alineados.
- Investigación académica sobre modelos sin censura: permite estudiar el comportamiento de sistemas "abliterated", analizar sesgos residuales y evaluar riesgos de seguridad en entornos controlados.
- Desarrollo de chatbots para entornos privados: gracias a su licencia Apache 2.0 y su formato GGUF, puede desplegarse localmente en aplicaciones de chat donde el usuario busca respuestas sin moderación automática.
- Pruebas de robustez en sistemas de moderación de contenido: al ser un modelo que genera contenido potencialmente dañino, puede usarse como caso de prueba para entrenar o evaluar filtros de contenido.
- Experimentación con cuantización y despliegue en hardware limitado: al ofrecer múltiples niveles de cuantización, es útil para probar el equilibrio entre tamaño, velocidad y calidad en GPU de consumo.
- Educación sobre riesgos de la IA generativa: sirve como ejemplo práctico de los peligros de eliminar salvaguardas, ilustrando la necesidad de gobernanza en el desarrollo de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - Q2_K (12.0 GB): requiere al menos 14 GB de VRAM para caber con el contexto.
  - Q4_K_M (18.8 GB): requiere al menos 20 GB de VRAM.
  - Q8_0 (32.7 GB): requiere al menos 36 GB de VRAM.
- GPU recomendadas:
  - Para cuantizaciones bajas (Q2_K, Q3_K): una RTX 3090 o RTX 4090 (24 GB) es suficiente.
  - Para Q4_K_M y superiores: se necesitan GPUs con 24 GB o más, como A100 (40 GB) o H100 (80 GB).
  - Para Q8_0: se recomienda una A100 80 GB o dos GPUs de 24 GB en paralelo.
- El modelo cabe en GPUs de consumo (RTX 3090, 4090) solo con cuantizaciones Q4_K_M o inferiores, siempre que se gestione el contexto con cuidado.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (TGI), vLLM (si se convierte a otro formato) y cualquier framework compatible con GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas concretas. Existen otras versiones de la serie XORTRON (por ejemplo, XORTRON.CriminalComputing.2026.27B.Instruct.v4-GGUF), pero no se han encontrado datos técnicos comparativos. Se recomienda consultar el repositorio del modelo base para obtener más detalles.

## Limitaciones y advertencias

- El modelo está etiquetado como "uncensored", "abliterated" y "toxic", lo que implica que puede generar contenido dañino, ofensivo o ilegal sin filtros. Su uso en producción conlleva riesgos legales y éticos.
- No se dispone de información sobre sesgos específicos, pero al ser un modelo sin alineación, es probable que refleje y amplifique sesgos presentes en sus datos de entrenamiento.
- Riesgo elevado de alucinaciones, especialmente en temas factuales, dado que no se ha verificado su rendimiento en benchmarks.
- La longitud de contexto no está documentada; se desconoce si el modelo maneja ventanas largas de forma eficiente.
- Aunque la licencia es Apache 2.0, el uso de contenido generado con este modelo puede violar políticas de plataformas o leyes locales según el contexto.
- No se garantiza la calidad de las cuantizaciones; los archivos de menor precisión (Q2_K, Q3_K) pueden degradar significativamente la coherencia del texto.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/mradermacher/XORTRON-CriminalComputing-EnablementEngine-v0.3-GGUF
- Modelo base (darkc0de/XORTRON-CriminalComputing-EnablementEngine-v0.3): https://huggingface.co/darkc0de/XORTRON-CriminalComputing-EnablementEngine-v0.3
- Página de descarga alternativa (MyGGUF): https://mygguf.com/model?id=mradermacher%2FXORTRON-CriminalComputing-EnablementEngine-v0.3-GGUF
- Otros modelos de la serie (referencia): https://huggingface.co/mradermacher/XORTRON.CriminalComputing.2026.27B.Instruct.v4-GGUF
