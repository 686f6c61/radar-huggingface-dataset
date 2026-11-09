# ErtasAI/MedErtas-v0.1-31B-LS-Perigee

## Resumen

MedErtas-v0.1-31B-LS-Perigee es un modelo borrador (draft model) especializado en dominio médico, desarrollado por ErtasAI como acompañante de su modelo principal MedErtas-v0.1-31B-LS. No es un modelo generativo autónomo: su función es acelerar la inferencia del modelo principal mediante decodificación especulativa con predicción multi-token (MTP) en vLLM. Propone varios tokens por adelantado que el modelo principal valida en una sola pasada, de modo que las respuestas finales siguen la distribución del modelo principal y solo cambia la velocidad.

El modelo parte de google/gemma-4-31B-it-assistant y se ha afinado sobre respuestas médicas evaluadas contra MedErtas-v0.1-31B-LS. Aunque la nomenclatura "31B" hace referencia al modelo principal sobre el que opera, los pesos reales del borrador son mucho menores: 469.518.596 parámetros y un repositorio de 1,0 GB, lo que refleja su naturaleza de modelo auxiliar compacto.

Su relevancia es operativa: en un despliegue clínico con vLLM, un borrador bien alineado con el modelo principal incrementa el número de tokens aceptados por pasada y, por tanto, el throughput. ErtasAI reporta 189 tokens/s en decodificación de un solo usuario en cálculo clínico frente a 168 con el asistente de Google, y un 38 % más de throughput total con 64 usuarios concurrentes en el mismo escenario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo borrador para decodificación especulativa MTP, derivado de Gemma 4) |
| Parametros totales | 469.518.596 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible para el borrador; el ejemplo de servicio del modelo principal usa `--max-model-len 65536` |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificación especulativa construido sobre google/gemma-4-31B-it-assistant. Se ha afinado sobre respuestas médicas y evaluado contra MedErtas-v0.1-31B-LS, el modelo principal con el que forma pareja. La arquitectura interna concreta (número de capas, dimensiones, mecanismo de atención) no se detalla en la información disponible; la model card solo indica que se ejecuta a través de la ruta de predicción multi-token (MTP) de Gemma 4 en vLLM 0.32.0, con 8 tokens de borrador por defecto.

El entrenamiento no reporta número de tokens, composición del dataset ni uso de RLHF o DPO. La innovación técnica es la especialización del borrador en el dominio médico: al acercar sus predicciones a la distribución del modelo principal en respuestas clínicas, aumenta la tasa de aceptación de tokens y reduce el coste por token generado. El mecanismo preserva la fidelidad de las respuestas, ya que el modelo principal verifica cada token propuesto.

## Capacidades

- Aceleración de inferencia mediante decodificación especulativa MTP con 8 tokens de borrador.
- Especialización en vocabulario y estructura de respuestas médicas (registros de pacientes, cálculos clínicos, respuestas de examen).
- Integración nativa con vLLM 0.32.0 y la ruta MTP de Gemma 4.
- Compatibilidad con prefix caching y KV cache en fp8 en el despliegue del modelo principal.
- Soporte indirecto de tool calling y agentes a través del modelo principal (parsers `gemma4` en el ejemplo de servicio).
- No está diseñado para generar texto de forma autónoma.

## Casos de uso

- Aceleración de un asistente clínico en producción: desplegado junto a MedErtas-v0.1-31B-LS en vLLM, reduce la latencia percibida en la generación de respuestas médicas sin alterar su contenido.
- Cálculo clínico interactivo: en tareas de dosificación o scores clínicos, el borrador alcanza 189 tokens/s en un solo usuario, lo que mejora la fluidez en interfaces de consulta médica.
- Atención a múltiples usuarios concurrentes: con 64 usuarios simultáneos reporta un 38 % más de throughput total en cálculo clínico, útil en plataformas hospitalarias o de triaje.
- Procesamiento de historiales largos: aunque en registros largos el rendimiento es similar al asistente de Google (170 frente a 169 tokens/s), mantiene la viabilidad de servir documentos extensos con contexto de hasta 65.536 tokens en el modelo principal.
- Generación de respuestas de examen médico: adecuado para plataformas de formación y evaluación clínica donde se prioriza el coste por token.
- Optimización de costes de infraestructura: al aumentar los tokens aceptados por pasada, reduce el número de pasadas necesarias y el coste de GPU por consulta en servicios médicos de alto volumen.

## Benchmarks y rendimiento

Mediciones con MedErtas-v0.1-31B-LS como modelo principal, 8 tokens de borrador, una RTX PRO 6000 con vLLM 0.32.0 (octubre de 2026). Velocidad de decodificación en tokens de salida por segundo, un solo usuario:

| Borrador | Registros largos de pacientes | Cálculo clínico | Respuestas de examen |
|---|---|---|---|
| Asistente de Gemma 4 de Google | 169 | 168 | 140 |
| Perigee | 170 | 189 | 141 |

Con 64 usuarios concurrentes en cálculo clínico, Perigee ofrece un 38 % más de throughput total de decodificación que el asistente de Google en el mismo entorno. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 1,0 GB en safetensors, por lo que el borrador requiere poca memoria adicional frente al modelo principal.
- GPU recomendadas: la medición oficial se realizó en una NVIDIA RTX PRO 6000.
- Cabe en GPU de consumo: no confirmado en la información disponible; el requisito dominante es el modelo principal de 31B, no el borrador.
- Despliegue: vLLM 0.32.0 con `--speculative-config '{"method":"mtp","model":"ErtasAI/MedErtas-v0.1-31B-LS-Perigee","num_speculative_tokens":8}'`, junto con `--language-model-only`, `--max-model-len 65536`, `--kv-cache-dtype fp8`, `--enable-prefix-caching`, `--reasoning-parser gemma4` y `--enable-auto-tool-choice --tool-call-parser gemma4`.
- Latencia y throughput: 189 tokens/s en cálculo clínico a un usuario y +38 % de throughput total a 64 usuarios concurrentes, según el autor.

## Comparativa con modelos similares

| Modelo | Función | Parametros | Contexto | Rendimiento reportado | Licencia |
|---|---|---|---|---|---|
| MedErtas-v0.1-31B-LS-Perigee | Borrador médico MTP | 469.518.596 | no disponible | 189 tok/s en cálculo clínico (1 usuario) | apache-2.0 |
| Asistente de Gemma 4 de Google | Borrador generalista | no disponible | no disponible | 168 tok/s en cálculo clínico (1 usuario) | no disponible |
| MedErtas-v0.1-31B-LS | Modelo principal médico | no disponible (31B nominal) | 65.536 en el ejemplo de servicio | Modelo de referencia, no borrador | no disponible |

La comparación directa solo es posible frente al asistente de Gemma 4, único borrador alternativo medido por el autor. No se dispone de datos de otros borradores médicos comparables.

## Limitaciones y advertencias

- No es un modelo generativo autónomo: no debe usarse para producir texto por sí mismo.
- Solo está validado con MedErtas-v0.1-31B-LS; su uso con Gemma 4 31B en BF16, otras builds de 4 bits u otras versiones de MedErtas no se ha medido.
- La ganancia de velocidad se concentra en cálculo clínico; en registros largos y respuestas de examen el rendimiento es prácticamente idéntico al asistente de Google.
- Hereda íntegramente las limitaciones y el uso previsto del modelo principal, incluidos sesgos y riesgo de alucinación en contexto médico.
- Solo soporta inglés según los metadatos.
- Aunque la licencia es Apache 2.0, el uso clínico real exige validación y supervisión profesional; no se documentan evaluaciones de seguridad clínica.
- Las versiones del borrador y del modelo principal avanzan conjuntamente, lo que obliga a mantener pares alineados en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ErtasAI/MedErtas-v0.1-31B-LS-Perigee
- Modelo principal: https://huggingface.co/ErtasAI/MedErtas-v0.1-31B-LS
- Modelo base: https://huggingface.co/google/gemma-4-31B-it-assistant
- Whitepaper: https://www.ertas.ai/research/medertas-v01-specialisation-inference-optimisation
- Página del modelo: https://www.ertas.ai/medertas
- Colecciones: https://huggingface.co/collections/ErtasAI
- Contacto enterprise: https://www.calendly.com/hello-ertas/enterprise
