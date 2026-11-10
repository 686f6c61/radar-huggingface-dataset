# mradermacher/Miko-L3-8B-v2-GGUF

## Resumen

Miko-L3-8B-v2-GGUF es la versión cuantizada en formato GGUF del modelo Miko-L3-8B-v2, un ajuste fino de Llama 3 de 8.000 millones de parámetros desarrollado originalmente por el usuario ricer0ll y cuantizado por mradermacher. El modelo está orientado a generación de texto conversacional, con especial énfasis en roleplay y narrativa interactiva, como indica la composición de su dataset de ajuste fino (PIPPA, LimaRP, Sonnet3.5-Charcard-Roleplay, entre otros). La versión GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo hereda la arquitectura transformer decoder-only de Llama 3, con 8.030.261.248 parámetros totales según los pesos en safetensors del modelo base. La licencia es Llama 3, lo que impone restricciones de uso comercial y obligaciones de atribución. El repositorio incluye múltiples cuantizaciones estáticas (Q2_K hasta f16), lo que facilita el despliegue en distintos niveles de VRAM.

La relevancia de esta ficha radica en que se trata de un modelo de nicho (roleplay conversacional en inglés) con muy poca tracción pública: cero descargas y cero likes en el momento de la consulta, y sin benchmarks publicados. Es útil para quien busque un modelo pequeño, ligero y especializado en diálogo creativo, pero no para tareas de razonamiento general, código o matemáticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Llama 3) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base Miko-L3-8B-v2 es un ajuste fino de Llama 3 de 8B, por lo que emplea la arquitectura transformer decoder-only estándar de Llama 3, con atención multi-cabeza, RoPE y normalización RMSNorm. No se dispone de información sobre el número de tokens de entrenamiento ni sobre si se aplicaron técnicas de RLHF o DPO; la model card del repositorio cuantizado no detalla el proceso de entrenamiento del modelo base.

Los datasets declarados para el ajuste fino son Xilabs/PIPPA-alpaca, Heralax/Augmental-Dataset, PJMixers/lemonilia_LimaRP-Only-NonSus-Simple-CustomShareGPT, Gryphe/Sonnet3.5-Charcard-Roleplay y anthracite-org/stheno-filtered-v1.1. Esta composición apunta a un entrenamiento orientado a conversación, roleplay y narrativa, con datos de carácter adulto (el tag `not-for-all-audiences` lo confirma). La cuantización la realiza mradermacher con cuantizaciones estáticas (no ponderadas/imatrix), según indica la propia model card.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Roleplay y narrativa interactiva, incluyendo personajes y escenarios.
- Diálogo creativo con estilo literario y descriptivo.
- Soporte de formato chat (tags `conversational` y `text-generation-inference`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al inglés según los metadatos del modelo.

## Casos de uso

- Roleplay conversacional: el modelo está ajustado específicamente con datasets de roleplay (LimaRP, Sonnet3.5-Charcard-Roleplay) para mantener personajes coherentes en conversaciones largas, adecuado para aplicaciones de entretenimiento interactivo.
- Generación de narrativa asistida: útil para escritores que necesiten continuar escenas o generar diálogos con estilo consistente, gracias a su entrenamiento en datos narrativos.
- Chatbots de personaje para comunidades: despliegue en servidores pequeños con llama.cpp u Ollama, dado que las cuantizaciones Q4_K_S (4,8 GB) caben en GPUs de consumo.
- Prototipado rápido de interfaces conversacionales: al ser un modelo de 8B en GGUF, permite iterar localmente sin depender de APIs externas.
- Experimentación con ajuste fino sobre Llama 3: sirve como punto de partida para quien quiera especializar aún más un modelo pequeño en dominios creativos.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece un abanico amplio de cuantizaciones (Q2_K a f16) para medir el impacto de la compresión en la calidad del diálogo.
- Generación de contenido creativo en inglés para blogs o ficción breve, siempre que se respeten las restricciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~3,3 GB; Q3_K_S ~3,8 GB; Q4_K_S ~4,8 GB; Q4_K_M ~5,0 GB; f16 ~16,2 GB (tamaños de archivo del repositorio).
- GPU recomendadas: RTX 3060 12 GB o superior para Q4_K_M; RTX 4090 o A100 para f16.
- Cabe en GPU de consumo: sí, con cuantizaciones Q2_K a Q5_K_M en GPUs de 6-8 GB; Q4_K_M es la opción recomendada por el autor ("fast, recommended").
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo TGI.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Miko-L3-8B-v2-GGUF | 8B | no disponible | llama3 | GGUF | Roleplay, inglés, sin benchmarks |
| Llama 3 8B Instruct | 8B | 8K (estándar Llama 3) | llama3 | safetensors, GGUF | Modelo generalista oficial de Meta |
| Mistral 7B Instruct | 7B | 32K | Apache 2.0 | safetensors, GGUF | Generalista, licencia permisiva |
| Stheno v1.1 (base de datos) | 8B | no disponible | llama3 | safetensors | Modelo de roleplay del que se usan datos |

La comparativa con Llama 3 8B Instruct y Mistral 7B Instruct es orientativa: Miko-L3-8B-v2 es un ajuste fino de nicho sin evaluación pública, por lo que no puede equipararse en rendimiento general a los modelos oficiales. La ventaja principal frente a ellos es su especialización en roleplay y su disponibilidad en múltiples cuantizaciones GGUF.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Llama 3 y entrenarse con datos de roleplay, puede reproducir sesgos de género, culturales y de contenido adulto.
- Riesgo de alucinación: alto en tareas factuales, ya que el ajuste fino prioriza diálogo creativo sobre precisión.
- Limitaciones de contexto: la longitud de contexto no está especificada en la información disponible; se asume la de Llama 3 8B, pero no está confirmado.
- Limitaciones de idioma: solo inglés según los metadatos; el rendimiento en castellano no está garantizado.
- Restricciones de licencia: Llama 3 Community License impone condiciones para uso comercial (límite de 700 millones de usuarios mensuales, obligaciones de atribución y restricciones de uso).
- Contenido para adultos: el tag `not-for-all-audiences` indica que el modelo puede generar contenido no apto para todo público; requiere moderación en producción.
- Sin benchmarks ni tracción: cero descargas y cero likes en el momento de la consulta; no hay evidencia pública de calidad.
- Cuantizaciones estáticas únicamente: no hay cuantizaciones ponderadas/imatrix, lo que puede reducir la calidad frente a alternativas optimizadas.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/mradermacher/Miko-L3-8B-v2-GGUF
- Modelo base: https://huggingface.co/ricer0ll/Miko-L3-8B-v2
- Página de overview del cuantizador: https://hf.tst.eu/model#Miko-L3-8B-v2-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de comparación de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset PIPPA-alpaca: https://huggingface.co/datasets/Xilabs/PIPPA-alpaca
- Dataset Augmental: https://huggingface.co/datasets/Heralax/Augmental-Dataset
- Dataset LimaRP filtrado: https://huggingface.co/datasets/PJMixers/lemonilia_LimaRP-Only-NonSus-Simple-CustomShareGPT
- Dataset Sonnet3.5-Charcard-Roleplay: https://huggingface.co/datasets/Gryphe/Sonnet3.5-Charcard-Roleplay
- Dataset Stheno filtrado: https://huggingface.co/datasets/anthracite-org/stheno-filtered-v1.1
