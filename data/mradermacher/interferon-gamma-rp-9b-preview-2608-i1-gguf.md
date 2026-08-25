# mradermacher/Interferon-gamma-RP-9B-Preview-2608-i1-GGUF

## Resumen

Interferon-gamma-RP-9B-Preview-2608-i1-GGUF es una cuantización en formato GGUF del modelo base Wonderlab-Testing-Grounds/Interferon-gamma-RP-9B-Preview-2608, realizada por el usuario mradermacher. Se trata de un ajuste fino (finetune) de la familia Qwen, orientado específicamente a roleplay (RP), roleplay erótico (ERP) y escritura creativa. El modelo está etiquetado como experimental y potencialmente inestable, lo que indica que es una versión de prueba destinada a explorar capacidades de generación narrativa de alta calidad.

Con aproximadamente 9.200 millones de parámetros, este modelo se posiciona en la gama media de tamaño, lo que permite su ejecución en hardware de consumo con las cuantizaciones adecuadas. La licencia Apache 2.0 facilita su uso comercial y modificación, aunque al ser una versión preliminar carece de garantías de estabilidad. Su relevancia radica en ofrecer una alternativa abierta y ligera para aplicaciones de generación de ficción interactiva y simulación de personajes, sin depender de APIs comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen) |
| Parametros totales | 9.197.093.888 (9,2 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (todas con imatrix) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con fichero imatrix adicional) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de un transformer de la familia Qwen, aunque no se especifica el número exacto de capas ni la configuración de atención. El modelo base ha sido sometido a un finetune para tareas de roleplay y escritura creativa, como indican los tags del repositorio. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. La cuantización fue realizada por mradermacher utilizando el método imatrix (importance matrix) para mejorar la calidad de las cuantizaciones de baja precisión.

## Capacidades

- Generacion de texto narrativo: esta especializado en roleplay, dialogo y escritura creativa, con una alta calidad en la creacion de personajes y tramas.
- Roleplay erotico (ERP): segun los tags, el modelo ha sido afinado para contenido explicito y adulto.
- Conversacion multi-turno: adecuado para mantener hilos de conversacion largos en contextos de rol, aunque la longitud de contexto no se ha publicado.
- Capacidad de escritura creativa: genera descripciones, narraciones y dialogos con un estilo natural, segun las indicaciones del autor.
- No se documentan capacidades de tool calling, agentes, vision ni audio.
- Soporte multilingue: solo ingles, sin datos de otros idiomas.

## Casos de uso

- **Simulacion de personajes en juegos de rol**: el modelo puede interpretar personajes con personalidad y coherencia, ideal para juegos de rol por texto o asistentes de escritura.
- **Escritura creativa asistida**: generacion de borradores de relatos, dialogos o descripciones, con la posibilidad de iterar sobre el texto generado.
- **Creacion de chatbots de entretenimiento para adultos**: su especializacion en ERP permite construir chatbots para plataformas de contenido adulto, siempre respetando las politicas de uso.
- **Prototipado de narrativa interactiva**: desarrolladores pueden usarlo para generar ramas de historias en videojuegos o experiencias narrativas, sin necesidad de un modelo de pago.
- **Generacion de contenido para fanfiction**: escritores pueden emplearlo para explorar variaciones de tramas o personajes, con una calidad narrativa notable.
- **Entrenamiento de modelos mas pequenos**: el modelo puede servir como profesor (teacher) para destilar conocimiento en modelos mas compactos, aunque esta aplicacion no esta documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de MMLU, HumanEval ni de tareas de roleplay. La ausencia de datos impide comparar numericamente con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: para la cuantizacion i1-Q4_K_M (5,9 GB), la VRAM necesaria en inferencia es de unos 6-7 GB, permitiendo su uso en tarjetas como la RTX 3060 12 GB o RTX 4060 Ti 16 GB.
- **GPU recomendadas**: cualquier GPU con al menos 8 GB de VRAM para las cuantizaciones Q4 o superiores. Para las versiones Q2 o Q3 (4-5 GB) basta con 6 GB, como una GTX 1660 Super.
- **Consumer GPU**: si, las cuantizaciones inferiores a Q4 caben en tarjetas de consumo de gama media. Las versiones Q5 y Q6 requieren 8-10 GB de VRAM.
- **Opciones de despliegue**: al ser GGUF, es compatible con llama.cpp, Ollama, KoboldCpp, LM Studio y otros motores que soporten este formato. Tambien puede usarse con vLLM si se convierte a safetensors.
- **Latencia y throughput**: no se conocen datos oficiales; en una RTX 4090 con Q4_K_M se esperan velocidades de 30-60 tokens/s, pero son estimaciones generales.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (finetunes de Qwen 9B para roleplay). El propio modelo base es la unica referencia. No se pueden ofrecer comparaciones numericas con otras alternativas sin datos fiables.

## Limitaciones y advertencias

- **Version experimental**: el modelo es una preview y se marca como "potencialmente inestable", lo que puede provocar salidas incoherentes o degradadas en algunos contextos.
- **Solo ingles**: no soporta otros idiomas, lo que limita su uso en entornos multilingue.
- **Riesgo de alucinacion**: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en contextos de rol.
- **Contenido explicito**: al estar orientado a ERP, puede producir contenido sexual explicito, lo que requiere moderacion si se despliega en aplicaciones publicas.
- **Sin informacion sobre sesgos**: no se publican estudios de sesgos ni de seguridad, por lo que no se puede garantizar su comportamiento en escenarios sensibles.
- **Licencia**: Apache 2.0 permite uso comercial, pero no hay garantias de soporte ni de mantenimiento.
- **Longitud de contexto desconocida**: no se ha publicado la ventana de contexto, lo que impide planificar aplicaciones con contextos largos.

## Enlaces

- Repositorio del modelo cuantizado: [mradermacher/Interferon-gamma-RP-9B-Preview-2608-i1-GGUF](https://huggingface.co/mradermacher/Interferon-gamma-RP-9B-Preview-2608-i1-GGUF)
- Repositorio con cuantizaciones estaticas: [mradermacher/Interferon-gamma-RP-9B-Preview-2608-GGUF](https://huggingface.co/mradermacher/Interferon-gamma-RP-9B-Preview-2608-GGUF)
- Modelo base: [Wonderlab-Testing-Grounds/Interferon-gamma-RP-9B-Preview-2608](https://huggingface.co/Wonderlab-Testing-Grounds/Interferon-gamma-RP-9B-Preview-2608)
