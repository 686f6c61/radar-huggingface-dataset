# fbaldassarri/allenai_OLMo-2-1124-13B-Instruct-auto_gptq-int4-gs64-sym

## Resumen

Esta ficha describe una versión cuantizada a 4 bits de `allenai/OLMo-2-1124-13B-Instruct`, el modelo instructivo de la familia OLMo 2 desarrollada por el Allen Institute for AI (AI2). La cuantización la firma el usuario fbaldassarri mediante Intel AutoRound 0.16.1 y el algoritmo GPTQ (AutoGPTQ), con pesos INT4, tamaño de grupo 64 y cuantización simétrica. El objetivo es reducir la huella de memoria y acelerar la inferencia (el autor declara entre 2 y 3 veces de mejora) manteniendo un comportamiento conversacional razonable, a costa de una ligera pérdida de precisión.

El modelo base OLMo 2 es un transformer causal de tipo decoder-only, entrenado desde cero con datos abiertos y publicado con licencia Apache 2.0, lo que lo convierte en una alternativa completamente abierta a las familias propietarias. Esta variante cuantizada está pensada explícitamente para ejecución en hardware Intel: CPU, iGPU Arc mediante intel-extension-for-pytorch y NPU (AI Boost de la serie Core Ultra) vía OpenVINO.

Un detalle importante: la model card declara `inference: false` y la ficha de Hugging Face reporta un total de 2.839.208.960 parámetros en safetensors, muy por debajo de los 13B nominales del modelo base. Eso sugiere que el repositorio publicado no contiene el conjunto completo de pesos del modelo, sino un subconjunto (probablemente solo algunos módulos cuantizados), por lo que debe tratarse con cautela antes de usarlo en producción. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (OLMo 2, `model_type: olmo2`) |
| Parámetros totales | 2.839.208.960 según safetensors del repo (el modelo base nominal es de 13B; discrepancia no aclarada en la model card) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | INT4, group size 64, simétrica (W4G64), GPTQ/AutoGPTQ vía Intel AutoRound 0.16.1 |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (configuración de cuantización AutoGPTQ), cargable con `transformers` |

## Arquitectura y entrenamiento

El modelo base OLMo 2 1124 13B Instruct es un transformer decoder-only de 13B parámetros entrenado por AI2 con un corpus abierto. La model card de esta variante cuantizada no detalla la composición del dataset de preentrenamiento ni las etapas de alineación (SFT, DPO u otras) del modelo original; esa información debe consultarse en la ficha oficial de `allenai/OLMo-2-1124-13B-Instruct`.

Lo relevante aquí es el proceso de cuantización. Se aplicó cuantización weights-only (WoQ) con el algoritmo GPTQ implementado en Intel AutoRound 0.16.1, cargando el modelo en `torch.bfloat16` sobre CPU. La calibración usó 64 muestras, 200 iteraciones de ajuste, longitud de secuencia 256 y batch size 2, con un tiempo total de cuantización registrado de 22.348,8 segundos (unas 6,2 horas). El resultado son pesos INT4 con grupo de 64 y simetría, exportados en formato AutoGPTQ. El autor indica que esta variante está optimizada para inferencia en CPU Intel, iGPU Arc (con intel-extension-for-pytorch) y NPU de la serie Core Ultra (con OpenVINO).

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat propia (`apply_chat_template`).
- Razonamiento y respuesta a instrucciones heredados del modelo instructivo original.
- Generación de código y matemáticas: capacidad esperable del modelo base, aunque no se documentan evaluaciones específicas en esta variante cuantizada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada para esta variante.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades especiales (visión, audio, modo thinking): no disponibles.

## Casos de uso

- Despliegue en estaciones de trabajo Intel sin GPU dedicada: el formato INT4 y la compatibilidad con intel-extension-for-pytorch permiten ejecutar el modelo en CPU con menor huella de memoria que la versión bf16, útil para prototipos locales.
- Inferencia en portátiles con Intel Core Ultra: la ruta OpenVINO sobre NPU (AI Boost) está pensada para asistentes conversacionales de baja latencia en entornos con restricciones térmicas y de batería.
- Chatbot interno de soporte en inglés: al ser un modelo instructivo con plantilla de chat, puede gestionar conversaciones multi-turno, aunque la ventana de contexto no está documentada y conviene validarla empíricamente.
- Generación asistida de código en entornos de desarrollo con hardware Intel: integrable mediante `transformers` en herramientas de autocompletado o revisión, siempre que se valide la calidad tras la cuantización.
- Experimentación académica con modelos abiertos: al derivar de OLMo 2 con licencia Apache 2.0, sirve para estudiar el impacto de la cuantización W4G64 en tareas de razonamiento y generación.
- Evaluación comparativa de técnicas de cuantización: el repositorio documenta la receta exacta de reproducción (AutoRound, parámetros de calibración), lo que facilita replicar el experimento y comparar con otras variantes INT4/INT8.
- Pruebas de integración en pipelines de CI para validar la carga de modelos GPTQ con `transformers` antes de desplegar variantes mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo declara cualitativamente una aceleración de 2 a 3 veces y una "ligera caída de precisión" en W4G64, sin cifras concretas de MMLU, HumanEval, GSM8K ni latencia/throughput medidos.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 11,0 GB en disco; con pesos INT4 el modelo base de 13B requeriría del orden de 7-8 GB solo para pesos, más overhead de activaciones y caché KV (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no documentadas para esta variante; el autor la orienta a CPU Intel, iGPU Arc y NPU Core Ultra.
- Compatibilidad con GPU de consumo: no confirmada; al ser AutoGPTQ podría cargarse en GPUs NVIDIA compatibles con esa ruta, pero no hay validación publicada.
- Opciones de despliegue: `transformers` con AutoGPTQ; intel-extension-for-pytorch para CPU/iGPU Intel; OpenVINO para NPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo la afirmación cualitativa de 2-3x de aceleración frente a la versión sin cuantizar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (OLMo-2-13B-Instruct INT4 GPTQ) | 13B nominales (repo reporta 2,84B en safetensors) | no disponible | INT4 W4G64 GPTQ | Apache 2.0 | Hugging Face, 0 descargas |
| allenai/OLMo-2-1124-13B-Instruct (original) | 13B | no disponible en esta ficha | bf16/fp16 | Apache 2.0 | Hugging Face, modelo oficial |
| Otras variantes INT4 de OLMo 2 | 13B | depende de la variante | INT4 (GPTQ/AWQ/etc.) | Apache 2.0 | no disponible en la información proporcionada |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Discrepancia crítica de parámetros: el repo declara 2.839.208.960 parámetros en safetensors frente a los 13B del modelo base, y la model card marca `inference: false`. Es probable que el artefacto esté incompleto o sea solo parcial; verificar antes de cualquier uso.
- Pérdida de precisión por cuantización: el propio autor reconoce una caída de exactitud en W4G64, que puede afectar a tareas sensibles como matemáticas o código.
- Solo inglés: la etiqueta de idioma es `en`; no hay soporte multilingüe documentado.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan mitigaciones específicas en esta variante.
- Sesgos: no se documentan evaluaciones de sesgo para esta cuantización; deben asumirse los del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara que el artefacto se desarrolló solo con fines de investigación y sin garantía.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad tras la cuantización.
- Repositorio sin tracción (0 descargas, 0 likes) y creado en 2026: sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fbaldassarri/allenai_OLMo-2-1124-13B-Instruct-auto_gptq-int4-gs64-sym
- Modelo base: https://huggingface.co/allenai/OLMo-2-1124-13B-Instruct
- Intel AutoRound (GitHub): https://github.com/intel/auto-round
- Pipeline de reproducción: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
