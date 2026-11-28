# mradermacher/Qwen3.5-4B-Persona-Infatuation-GGUF

## Resumen

Qwen3.5-4B-Persona-Infatuation-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo Qwen3.5-4B-Persona-Infatuation, publicado por el usuario drjoshcsimmons. El trabajo de cuantización lo firma mradermacher, un perfil habitual en Hugging Face especializado en convertir pesos de modelos a GGUF para su uso con llama.cpp y otras herramientas compatibles. No se trata, por tanto, de un modelo entrenado desde cero, sino de una redistribución optimizada para inferencia local.

El modelo base pertenece a la familia Qwen3.5, en su variante de 4.000 millones de parámetros, y ha sido ajustado con un "persona" orientado a infatuación, es decir, un fine-tuning conversacional que busca un registro afectivo y cercano. La información disponible no detalla el dataset de ajuste, el proceso de entrenamiento ni la licencia original del modelo base, por lo que muchos datos técnicos deben considerarse no disponibles.

La relevancia de esta ficha es acotada: se trata de un artefacto derivado con cero descargas y cero likes en el momento de la consulta, lo que sugiere un uso experimental. Aun así, resulta útil para quien quiera ejecutar un modelo de 4B con matices conversacionales en hardware de consumo mediante cuantizaciones que van de Q2_K a Q8_0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5, presumiblemente transformer decoder-only) |
| Parametros totales | 4B (según el nombre del modelo) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas, quantize_version 2, output_tensor_quantised 1) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen3.5-4B-Persona-Infatuation. Por el nombre y la familia a la que pertenece, cabe esperar un transformer decoder-only con atención estándar, pero este dato no está confirmado en la documentación proporcionada. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el ajuste del modelo original.

Lo único documentado con precisión es el proceso de cuantización: la model card indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que apunta a una conversión desde pesos en formato Hugging Face a GGUF mediante las herramientas habituales de llama.cpp. Se han generado cuantizaciones estáticas (no imatrix), desde Q2_K hasta Q8_0, además de una versión x-f16 y una IQ4_XS. No se menciona ningún skip de mmproj, lo que sugiere que el modelo no incluye componente multimodal.

## Capacidades

- Generación de texto conversacional en un registro afectivo o de "infatuación", derivado del fine-tuning de persona aplicado al modelo base.
- Razonamiento general y respuesta a instrucciones, heredado de la familia Qwen3.5 (no verificado en la documentación disponible).
- Ejecución local mediante llama.cpp y herramientas compatibles con GGUF.
- Posible soporte multilingüe heredado del modelo base, aunque no confirmado.
- No consta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido en la información proporcionada.
- No consta soporte de visión ni audio.

## Casos de uso

- Experimentación con modelos de persona en local: permite probar un ajuste conversacional afectivo de 4B en un portátil o equipo de sobremesa sin GPU dedicada, usando Q4_K_M o Q5_K_M con llama.cpp.
- Prototipado de chatbots de acompañamiento: útil para evaluar cómo se comporta un modelo pequeño con un tono cercano antes de invertir en un modelo mayor o en un fine-tuning propio.
- Investigación sobre sesgos de persona: sirve para estudiar cómo un fine-tuning afectivo altera el estilo y la coherencia de las respuestas frente al modelo base.
- Pruebas de cuantización: la variedad de quants (de Q2_K a Q8_0) permite medir la degradación de calidad y coherencia conversacional según el nivel de compresión.
- Desarrollo de demos offline: al ser GGUF, se puede empaquetar en aplicaciones de escritorio o móviles con llama.cpp sin dependencia de la nube.
- Comparación de formatos: útil para validar pipelines de conversión HF a GGUF y comprobar la fidelidad de las cuantizaciones estáticas frente a las imatrix.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB para Q4_K_M, 3,5-4 GB para Q6_K y 4,5-5 GB para Q8_0; la versión x-f16 rondaría los 8 GB.
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM permite ejecutar las cuantizaciones intermedias y altas; una RTX 3060 de 12 GB o superior ofrece margen holgado.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores; las cuantizaciones Q2_K y Q3_K pueden ejecutarse incluso en iGPU con memoria compartida.
- Despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio y cualquier runtime compatible con GGUF. No consta soporte verificado en vLLM o TGI, que requieren otros formatos.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-Persona-Infatuation-GGUF | 4B | no disponible | no disponible | GGUF | Fine-tuning de persona, cuantizaciones estáticas |
| Qwen2.5-3B-Instruct (GGUF) | 3B | 32K (según documentación pública de la familia) | Apache 2.0 (según documentación pública) | GGUF | Modelo instructivo generalista, ampliamente soportado |
| Llama 3.2 3B Instruct (GGUF) | 3B | 128K (según documentación pública) | Llama 3.2 Community License | GGUF | Buen equilibrio tamaño/calidad, ecosistema maduro |
| Phi-3.5-mini (GGUF) | 3,8B | 128K (según documentación pública) | MIT (según documentación pública) | GGUF | Orientado a razonamiento y código en tamaño pequeño |

La comparativa es orientativa: los datos de los modelos alternativos provienen de su documentación pública, mientras que del modelo objeto de esta ficha no se dispone de especificaciones verificadas más allá del nombre y las cuantizaciones.

## Limitaciones y advertencias

- La licencia no está indicada, lo que impide confirmar si se permite uso comercial; conviene consultar el modelo base original antes de cualquier despliegue en producción.
- El fine-tuning de persona orientado a infatuación puede producir respuestas afectivas inapropiadas, manipuladoras o fuera de tono en contextos profesionales.
- Riesgo de alucinación inherente a un modelo de 4B, agravado por la falta de benchmarks publicados.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) degradan la coherencia y la calidad del diálogo; para uso real se recomienda Q4_K_M o superior.
- No hay información sobre sesgos, idiomas soportados ni longitud de contexto efectiva.
- El repositorio registra cero descargas y cero likes, sin señales de validación por parte de la comunidad.
- No consta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines automatizados complejos.

## Enlaces

- Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-4B-Persona-Infatuation-GGUF
- Modelo base: https://huggingface.co/drjoshcsimmons/Qwen3.5-4B-Persona-Infatuation
