# mradermacher/RusNanoLM-800M-GGUF

## Resumen

RusNanoLM-800M es un modelo de lenguaje de menos de mil millones de parámetros desarrollado por RusMiniLM y orientado principalmente al ruso, con soporte secundario de inglés. Está especializado en matemáticas y razonamiento, y su model card lo etiqueta como derivado de la familia Qwen3.5 con atención lineal (linear-attention), lo que sugiere una arquitectura híbrida pensada para reducir el coste computacional del mecanismo de atención en contextos largos. El modelo base fue ajustado mediante SFT (supervised fine-tuning).

La ficha que nos ocupa no corresponde al modelo original, sino a la versión cuantizada en formato GGUF publicada por mradermacher, un conocido generador de cuantizaciones estáticas para llama.cpp. El repositorio ofrece un abanico de cuantizaciones que va desde Q2_K (0,5 GB) hasta f16 (1,6 GB), pasando por Q4_K_M, Q5_K_M, Q6_K y Q8_0, lo que permite ejecutar el modelo en hardware muy modesto, incluidos equipos de consumo sin GPU dedicada.

Su relevancia radica en dos factores: por un lado, cubre el nicho de modelos pequeños con foco en ruso y razonamiento matemático, un área con menos oferta que el inglés; por otro, al estar disponible en GGUF, se puede desplegar en local con llama.cpp u Ollama con requisitos mínimos de memoria. El tamaño real reportado en safetensors es de 752.393.024 parámetros, ligeramente por debajo de los 800M que sugiere el nombre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal (linear-attention), etiquetado como qwen3.5 en la model card |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ru, en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original en safetensors |

## Arquitectura y entrenamiento

La model card etiqueta el modelo como «qwen3.5» y «linear-attention», lo que apunta a una arquitectura de transformer con capas de atención lineal en lugar de atención cuadrática completa, un diseño habitual para abaratar el coste en contextos largos y en modelos pequeños. No se especifica en la información disponible el número de capas, dimensiones ocultas, cabezas de atención ni la proporción exacta de capas lineales frente a capas de atención estándar.

El entrenamiento del modelo base consistió en un ajuste supervisado (SFT) según la etiqueta «sft» de la model card. No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documenta ninguna innovación adicional más allá de la atención lineal y la especialización en matemáticas y razonamiento. Las cuantizaciones publicadas son estáticas (quantize_version 2, output_tensor_quantised 1); el autor indica que no hay cuantizaciones ponderadas/imatrix disponibles por el momento.

## Capacidades

- Generación de texto conversacional en ruso e inglés, con etiqueta «conversational» en el repositorio.
- Razonamiento matemático y resolución de problemas, según las etiquetas «math» y «reasoning».
- Razonamiento multi-paso orientado a tareas analíticas, derivado de su especialización en matemáticas.
- Soporte bilingüe ru/en; el ruso es el idioma principal y el inglés el secundario.
- Ejecución local en hardware modesto gracias a las cuantizaciones GGUF de 0,5 a 1,6 GB.
- Compatibilidad con endpoints (etiqueta «endpoints_compatible»), lo que facilita su integración en servicios de inferencia.
- No se documenta soporte de tool calling, function calling, visión, audio ni modo de pensamiento explícito en la información disponible.

## Casos de uso

- Tutoría matemática en ruso: el modelo puede resolver y explicar problemas aritméticos y algebraicos paso a paso, aprovechando su especialización en matemáticas y su idioma principal. Adecuado para entornos educativos con presupuesto de hardware limitado.
- Asistente conversacional en ruso para atención al cliente: al ser un modelo pequeño y bilingüe, puede gestionar diálogos multi-turno sencillos en un servidor modesto o incluso en local, con latencia baja gracias a las cuantizaciones Q4_K_M o Q5_K_M.
- Procesamiento de texto en dispositivos de borde: con cuantizaciones de 0,5-0,7 GB, cabe en Raspberry Pi, mini-PC o portátiles sin GPU, lo que permite tareas de resumen, clasificación o extracción de información sin conexión.
- Generación de borradores y respuestas en inglés y ruso para herramientas de productividad: el modelo puede redactar correos, resúmenes o respuestas breves en ambos idiomas, integrándose en editores o asistentes de escritorio vía llama.cpp.
- Prototipado rápido de pipelines de razonamiento: investigadores que necesiten un modelo pequeño para experimentar con cadenas de razonamiento matemático pueden usar la versión Q8_0 o f16 como referencia y comparar con modelos mayores.
- Filtrado y preprocesado de datos en ruso: el modelo puede clasificar o etiquetar textos rusos en pipelines de curación de datasets, aprovechando su licencia Apache 2.0 para uso comercial.
- Educación y experimentación académica: al ser un modelo sub-1B con licencia permisiva, es útil para estudiar el comportamiento de arquitecturas con atención lineal y para fine-tuning en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-0,6 GB con Q2_K/Q4_K_S, 0,6-0,7 GB con Q5_K_M, 0,7 GB con Q6_K, 0,9 GB con Q8_0 y 1,6 GB con f16, más el overhead del contexto y de llama.cpp.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen de sobra. En GPU profesionales, una A100 o H100 no aporta ventaja significativa por el tamaño reducido del modelo, salvo por el throughput agregado en despliegues por lotes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con memoria unificada suficiente.
- Cabe en CPU: sí, con cuantizaciones Q4_K_M o inferiores; el modelo puede ejecutarse íntegramente en CPU con llama.cpp a velocidades interactivas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con transformers, vLLM o TGI, aunque para este tamaño llama.cpp suele ser la opción más eficiente.
- Latencia y throughput estimados: no disponibles de forma oficial; por el tamaño (menos de 1B parámetros) se espera una latencia muy baja en hardware de consumo, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| RusNanoLM-800M (este) | 752M | no disponible | ru, en | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-0.5B | 494M | 32K (según documentación pública de Qwen) | multilingüe | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-1.5B | 1.540M | 32K (según documentación pública de Qwen) | multilingüe | Apache 2.0 | safetensors, GGUF |
| SmolLM2-1.7B | 1.700M | 8K (según documentación pública) | en (principalmente) | Apache 2.0 | safetensors, GGUF |

La comparación con Qwen y SmolLM2 se basa en datos públicos de sus respectivas documentaciones; no se dispone de benchmarks de RusNanoLM-800M que permitan una comparación de rendimiento directa. La principal diferencia de RusNanoLM-800M es su especialización en ruso y matemáticas frente a modelos multilingües de propósito general.

## Limitaciones y advertencias

- Riesgo de alucinación: como todo modelo de menos de mil millones de parámetros, la tasa de errores factuales es alta, especialmente fuera de dominios matemáticos.
- Sesgos: no se documentan evaluaciones de sesgo; el entrenamiento con foco en ruso e inglés puede infrarepresentar otras lenguas y culturas.
- Limitaciones de idioma: solo se declaran ruso e inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Contexto: no se especifica la longitud de contexto soportada, lo que dificulta planificar casos de uso con documentos largos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base RusMiniLM/RusNanoLM-800M por si hubiera restricciones adicionales no reflejadas en la model card.
- Cuantizaciones: las versiones Q2_K y Q3_K_S degradan la calidad de forma notable; para producción se recomienda Q4_K_M o superior. El autor advierte que Q3_K_M es de «lower quality».
- Sin cuantizaciones imatrix: el autor indica que no hay cuantizaciones ponderadas disponibles, lo que puede afectar ligeramente la calidad frente a alternativas con imatrix.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/RusNanoLM-800M-GGUF
- Modelo base: https://huggingface.co/RusMiniLM/RusNanoLM-800M
- Página de resumen del cuantizador: https://hf.tst.eu/model#RusNanoLM-800M-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Referencia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
