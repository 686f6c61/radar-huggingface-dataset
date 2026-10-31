# mradermacher/Granite-4.2-8B-Surgical-Abliterated-i1-GGUF

## Resumen

Esta ficha corresponde a una cuantización GGUF con imatrix (matriz de importancia) del modelo **Granite-4.2-8B-Surgical-Abliterated**, publicada por el cuantizador comunitario **mradermacher** en Hugging Face. El modelo base es una versión "abliterated" (con los filtros de rechazo eliminados mediante la técnica conocida como abliteration o alineación quirúrgica) de un modelo Granite de IBM de unos 8B parámetros, adaptado por medismera. El resultado es un modelo conversacional sin restricciones de seguridad orientado a uso local, distribuido en más de 20 variantes de cuantización que van desde IQ1_S (2,2 GB) hasta Q8 y superiores.

Su relevancia radica en la combinación de tres factores: la base Granite de IBM (arquitectura transformer densa de 8,79 mil millones de parámetros), la eliminación de los mecanismos de rechazo para permitir respuestas sin censura, y la disponibilidad en formato GGUF, que permite ejecutarlo en hardware de consumo mediante llama.cpp, Ollama, LM Studio u otros backends compatibles. El modelo está diseñado para inglés y se publica bajo licencia Apache 2.0, lo que permite su uso comercial. Cabe destacar que la variante abliterated se dirige a un dominio quirúrgico/médico según su denominación, aunque la model card no documenta el proceso de ajuste fino específico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM (transformer decoder, base Granite de IBM) |
| Parametros totales | 8.791.592.960 (≈8,79B, dato real de safetensors) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (todas con imatrix) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado desde safetensors originales) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder causal de la familia Granite de IBM con aproximadamente 8,79 mil millones de parámetros. Sobre esa base, medismera aplicó un proceso de "abliteration" (etiquetado en los tags como *surgical-alignment*), una técnica post-entrenamiento que identifica y neutraliza las direcciones latentes responsables de los rechazos de seguridad en el modelo, eliminando su comportamiento de censura sin necesidad de reentrenamiento completo. La model card del cuantizador no detalla el procedimiento exacto ni los datos de entrenamiento del ajuste fino quirúrgico del modelo base.

La contribución de mradermacher es exclusivamente de cuantización: se generaron versiones GGUF ponderadas con **imatrix** (importance matrix), que calcula una matriz de importancia a partir de datos de calibración para reducir el error de cuantización en los tensores más sensibles. Esto permite que cuants agresivos (IQ2/IQ3) conserven más calidad que sus equivalentes estáticos. También existe un repo paralelo con cuants estáticos sin imatrix.

## Capacidades

- Generación de texto conversacional en inglés sin mecanismos de rechazo (abliterated).
- Hereda las capacidades generales del modelo base Granite 4.2 8B (razonamiento, código, matemáticas, según el modelo original de IBM), aunque la model card no documenta el impacto de la abliteration sobre ellas.
- Orientación aparente al dominio quirúrgico/médico según la denominación del modelo base, sin documentación pública del ajuste.
- Ejecución local en CPU y GPU mediante backends GGUF (llama.cpp y derivados).
- No hay información disponible sobre soporte de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- **Investigación en alineación y seguridad de modelos:** el modelo sirve como sujeto de estudio para analizar cómo la abliteration modifica el comportamiento de un modelo Granite, útil para equipos de AI safety y red-teaming.
- **Asistentes locales sin restricciones para escritura creativa:** generación de ficción con contenido sensible donde los filtros estándar bloquearían la salida, ejecutada íntegramente en local (Q4_K_M ocupa solo 5,4 GB).
- **Prototipado en hardware de consumo:** las variantes IQ2/IQ3 (2,6–4,4 GB) permiten probar el modelo en portátiles sin GPU dedicada, útil para desarrollo iterativo rápido.
- **Exploración de dominio médico/quirúrgico:** dado el nombre del modelo base, puede emplearse para experimentos con terminología quirúrgica en inglés, siempre con supervisión experta y sin uso clínico real.
- **Generación de datasets sintéticos sin rechazos:** creación de pares instrucción-respuesta donde el modelo original se negaría a responder, para posterior reentrenamiento o evaluación.
- **Pruebas de calidad de cuantización imatrix:** comparación entre cuants estáticos y ponderados con imatrix en un modelo de 8B, útil para trabajos sobre compresión de LLMs.
- **Integración en pipelines locales con llama.cpp:** despliegue offline en entornos sin conexión donde se requiere un modelo conversacional sin filtros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye evaluaciones de MMLU, HumanEval, GSM8K ni comparativas de calidad entre cuants, y tampoco hay datos públicos del modelo base medismera/Granite-4.2-8B-Surgical-Abliterated en la informacion proporcionada.

## Requisitos de hardware

- **VRAM/RAM estimada según cuant** (tamaño del archivo + overhead de contexto, aproximadamente +0,5–1 GB):
  - IQ1_S (2,2 GB) / IQ1_M (2,4 GB): ejecutable en cualquier portátil moderno con 8 GB de RAM, con pérdida de calidad severa.
  - IQ3_M (4,2 GB) / Q3_K_M (4,4 GB): viable en 8 GB de RAM o GPU de 6 GB.
  - Q4_K_M (5,4 GB, recomendado): GPU de 8 GB (RTX 3060, RTX 4060) o 16 GB de RAM en CPU.
  - Q5_K_M (6,4 GB) / Q6_K: GPU de 8–12 GB (RTX 4070/4080).
  - Q8_0 y superiores: GPU de 12–16 GB o ejecución en CPU con 16 GB de RAM.
- **GPUs recomendadas:** RTX 3060/4060 (12/8 GB) para cuants Q4; RTX 4090 (24 GB) para los cuants más altos con contextos largos; en servidor, cualquier GPU con suficiente VRAM acelerará el prefill.
- **Consumer GPUs:** sí, cabe con holgura en prácticamente cualquier GPU de consumo desde 6 GB con cuants IQ3/Q4.
- **Despliegue:** llama.cpp (formato nativo), Ollama, LM Studio, KoboldCpp, text-generation-webui, Jan; cualquier runtime compatible con GGUF e imatrix.
- **Latencia y throughput:** no disponibles; en un modelo denso de 8B cuantizado a Q4_K_M se esperan velocidades típicas de 30–60 tokens/s en CPU moderno con DDR5 y >100 tokens/s en GPU de consumo, aunque son estimaciones no documentadas en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Particularidad |
|---|---|---|---|---|
| Granite-4.2-8B-Surgical-Abliterated (esta ficha) | 8,79B | GGUF (imatrix, 20+ cuants) | Apache 2.0 | Abliterated, dominio quirúrgico, inglés |
| Granite 8B original de IBM (base) | ≈8B | safetensors | Apache 2.0 | Modelo base con filtros de seguridad intactos |
| Otros 8B abliterated comunitarios (p. ej. variantes abliterated de Llama 3.1 8B) | ≈8B | safetensors + GGUF | Varía (Llama Community License) | Misma técnica de abliteration, base distinta |

La ventaja diferencial de esta versión es la combinación de licencia Apache 2.0 (más permisiva que la de Llama), la base Granite de IBM y la amplia gama de cuants con imatrix, lo que facilita su ejecución en hardware muy variado.

## Limitaciones y advertencias

- **Modelo abliterated:** la eliminación de filtros de seguridad incrementa el riesgo de generar contenido dañino, ilegal o inapropiado. Su uso exige responsabilidad y cumplimiento legal; no debe desplegarse en producción orientada a usuarios finales sin salvaguardas externas.
- **Sin garantía de calidad médica:** pese a la denominación quirúrgica, no hay documentación del ajuste ni validación clínica; no es apto para uso médico real ni como fuente de información sanitaria fiable.
- **Riesgo de alucinación:** no hay benchmarks públicos que cuantifiquen la tasa de alucinación; además, la abliteration puede degradar el razonamiento y la exactitud factual del modelo base.
- **Idioma:** optimizado para inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior.
- **Contexto:** la longitud de ventana de contexto no está indicada en la model card; debe verificarse en la configuración del modelo base antes de planificar cargas con documentos largos.
- **Cuants agresivos:** las variantes IQ1/IQ2 (2,2–3,3 GB) presentan degradación notable de calidad, tal como advierte el propio autor ("for the desperate").
- **Procedencia:** es una cuantización de terceros de un modelo derivado de terceros; la cadena Granite (IBM) → medismera → mradermacher introduce capas de modificación sin auditoría formal.

## Enlaces

- Repositorio GGUF imatrix (esta ficha): https://huggingface.co/mradermacher/Granite-4.2-8B-Surgical-Abliterated-i1-GGUF
- Modelo base abliterated: https://huggingface.co/medismera/Granite-4.2-8B-Surgical-Abliterated
- Cuants estáticos del mismo modelo: https://huggingface.co/mradermacher/Granite-4.2-8B-Surgical-Abliterated-GGUF
- Página de descarga resumida de mradermacher: https://hf.tst.eu/model#Granite-4.2-8B-Surgical-Abliterated-i1-GGUF
- Guía de uso de GGUF referenciada (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
