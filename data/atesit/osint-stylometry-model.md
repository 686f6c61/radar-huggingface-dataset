# AtesiT/osint-stylometry-model

## Resumen

El modelo **OSINT Stylometry Model** es un encoder de texto basado en la arquitectura **Sentence-BERT (Siamese Network)**, desarrollado por el autor AtesiT, que transforma cualquier texto (publicaciones, comentarios, mensajes de chat, respuestas en foros) en un vector numérico compacto denominado «huella estilística» (stylistic fingerprint). La idea central es que dos textos escritos por la misma persona presentan una alta similitud coseno entre sus vectores, incluso si tratan temas completamente distintos, mientras que textos de autores diferentes quedan separados en el espacio vectorial, aunque compartan temática.

El modelo está específicamente entrenado para **ignorar el contenido** y centrarse en la forma: hábitos de puntuación, erratas características, jerga recurrente, patrones de uso de emojis, mezcla de idiomas (ruso e inglés, con transliteración y leetspeak) y longitud típica de las frases. Estos rasgos constituyen lo que los psicólogos y forenses denominan **idiolecto**, una marca personal difícil de ocultar o falsificar a largo plazo. Con 22,7 millones de parámetros y un tamaño de repositorio de 0,3 GB, es un modelo ligero orientado a tareas de OSINT, inteligencia de amenazas, atribución de ciberataques y análisis forense digital.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sentence-BERT (Siamese Network) basada en BERT |
| Parametros totales | 22.713.216 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card menciona ruso e inglés) |
| Licencia | no disponible (la model card indica MIT) |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura **Sentence-BERT** (Siamese Network), que consiste en un encoder BERT preentrenado al que se le añade una capa de pooling para obtener una representación vectorial fija de la frase o texto completo. Durante el entrenamiento, se utilizan pares de textos (siameses) para optimizar la similitud coseno entre vectores de textos del mismo autor y minimizarla entre autores distintos. La model card indica que el modelo ha sido «doobtenido» (fine-tuned) específicamente para estilometría, pero no se proporcionan detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas como RLHF o DPO. Tampoco se especifica el número de tokens de entrenamiento ni la longitud máxima de secuencia soportada.

## Capacidades

- **Atribución de autoría**: dado un texto, genera un embedding que permite comparar con otros textos para determinar si pertenecen al mismo autor.
- **Detección de cambios de estilo**: al comparar nuevos mensajes con el perfil histórico de un autor, puede señalar desviaciones anómalas que sugieran compromiso de cuenta o suplantación.
- **Análisis de similitud estilística**: calcula la similitud coseno entre vectores de diferentes textos, permitiendo construir grafos de relaciones entre cuentas anónimas.
- **Soporte multilingüe parcial**: la model card menciona que el modelo maneja mezclas de ruso e inglés, incluyendo transliteración y leetspeak, aunque no se especifican otros idiomas.
- **Inferencia eficiente**: al ser un modelo pequeño (22M parámetros), puede ejecutarse en CPU con latencias de milisegundos, y está disponible en formato ONNX para despliegue ligero.
- **Integración con pipelines de OSINT**: puede usarse como componente en sistemas de inteligencia de fuentes abiertas para priorizar investigaciones.

## Casos de uso

- **Deanonimización de propietarios de canales de Telegram y cuentas de foros**: un analista OSINT puede comparar los embeddings de publicaciones de diferentes cuentas anónimas para detectar si pertenecen a la misma persona, incluso cuando no hay vínculos técnicos directos (IP, dispositivo, número de teléfono). El modelo permite construir un grafo de conexiones probables y priorizar investigaciones.
- **Atribución de fugas de datos a grupos específicos (Threat Intelligence)**: cuando aparece un nuevo dump en la dark web, el modelo puede comparar el estilo de los textos que lo acompañan (anuncios de venta, comunicaciones) con una base de perfiles estilísticos de actores ya conocidos, proporcionando una probabilidad de pertenencia a un grupo existente.
- **Detección de compromiso de cuentas corporativas o de influencers**: al monitorizar continuamente los mensajes publicados en una cuenta y compararlos con el perfil histórico del autor, el modelo actúa como sistema de alerta temprana ante cambios bruscos de estilo que indiquen que la cuenta ha sido hackeada o está siendo utilizada por otra persona.
- **Verificación de independencia de fuentes anónimas**: en investigaciones con múltiples informantes anónimos, el modelo ayuda a determinar si dos fuentes son realmente personas distintas o si se trata de la misma persona usando varios alias, lo que es crítico para evaluar la fiabilidad de la información.
- **Análisis forense de mensajes en casos legales**: los equipos de forensia digital pueden usar el modelo para comparar mensajes incautados de diferentes dispositivos o cuentas y establecer si fueron escritos por el mismo individuo, aportando evidencia en procedimientos judiciales.
- **Monitoreo de reputación y detección de suplantación**: marcas y figuras públicas pueden emplear el modelo para detectar cuentas falsas que imitan su estilo de escritura, comparando los embeddings de publicaciones sospechosas con el perfil auténtico del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una sección de «métricas de calidad» (Метрики качества), pero no se ha extraído su contenido en los datos proporcionados. Por tanto, no es posible presentar una tabla comparativa con valores numéricos.

## Requisitos de hardware

- **VRAM estimada**: no disponible. Dado el tamaño del modelo (22,7M parámetros), se puede inferir que requiere menos de 1 GB de memoria en FP32, pero no se proporcionan datos oficiales.
- **GPU recomendadas**: no disponible. El modelo es suficientemente pequeño para ejecutarse en CPU, y su formato ONNX sugiere que está pensado para inferencia en entornos sin GPU.
- **Compatibilidad con GPU de consumo**: probablemente sí, en cualquier GPU moderna (por ejemplo, RTX 3060 o superior), aunque no hay confirmación oficial.
- **Opciones de despliegue**: al estar disponible en safetensors y ONNX, puede integrarse con frameworks como Hugging Face Transformers, ONNX Runtime, o herramientas como llama.cpp (si se convierte a GGUF, aunque no se indica). También es compatible con Sentence-Transformers.
- **Latencia y throughput**: la model card menciona «inferencia a través de ONNX (CPU, milisegundos)», lo que sugiere latencias muy bajas, pero no se aportan cifras concretas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se puede establecer una comparativa con alternativas de la misma categoría (por ejemplo, otros modelos de estilometría o atribución de autoría) sin datos adicionales.

## Limitaciones y advertencias

- **Dependencia del idioma**: la model card indica soporte para ruso e inglés, pero no se especifica si funciona correctamente en otros idiomas. Su uso fuera de estos ámbitos podría dar resultados poco fiables.
- **Riesgo de sesgo**: al estar entrenado en un corpus no documentado, puede presentar sesgos hacia ciertos estilos de escritura o demografías, lo que podría afectar a la precisión en poblaciones no representadas.
- **Alucinación y falsos positivos**: como cualquier modelo de similitud, puede generar coincidencias falsas entre textos de autores diferentes si sus estilos son muy similares, o no detectar diferencias sutiles.
- **Restricciones de licencia**: la licencia no está especificada en Hugging Face; la model card muestra un badge MIT, pero no se confirma oficialmente. Se recomienda contactar al autor antes de un uso comercial.
- **Limitaciones de contexto**: no se conoce la longitud máxima de secuencia que el modelo puede procesar; textos muy largos podrían truncarse o degradar el rendimiento.
- **Consideraciones éticas**: el uso de estilometría para deanonimización plantea riesgos de privacidad y puede violar normativas de protección de datos. Se debe emplear únicamente en contextos legales y con consentimiento adecuado.

## Enlaces

- [Hugging Face - AtesiT/osint-stylometry-model](https://huggingface.co/AtesiT/osint-stylometry-model)
