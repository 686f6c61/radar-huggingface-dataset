# luispoveda93/Gala

## Resumen

Gala es un modelo conversacional centrado en catalán, desarrollado por el usuario independiente luispoveda93 y publicado en HuggingFace. Se trata de un ajuste fino por SFT del modelo multimodal Qwen/Qwen3.5-0.8B (852.985.920 parámetros), entrenado sobre datos de chat en catalán procedentes de BSC-LT y projecte-aina. El objetivo es claro: mejorar el rendimiento del modelo base en tareas de instrucción, alineación y conocimiento cultural catalán, un nicho donde los modelos pequeños generalistas rinden de forma deficiente.

La relevancia del modelo es doble. Por un lado, demuestra que un ajuste fino LoRA de bajo rango (r=16, α=32) sobre un modelo de menos de mil millones de parámetros puede producir mejoras medibles en benchmarks catalanes concretos, con un coste de entrenamiento de poco más de 21 horas en una única GPU T4. Por otro, se publica con licencia Apache-2.0, lo que facilita su reutilización y experimentación sin las restricciones de otros conjuntos de datos catalanes con licencias más restrictivas.

El modelo hereda del base la arquitectura y la torre de visión, aunque esta última no se ha entrenado ni evaluado. Su uso previsto es el de asistente conversacional catalán para experimentación y demostraciones, no para producción con requisitos factuales estrictos sin salvaguardas adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5), ajuste fino SFT con LoRA fusionado; torre de visión sin modificar |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usó empaquetado a 2.048 tokens) |
| Tipos de cuantizacion | No disponible (no se publican pesos GGUF en esta ficha) |
| Idiomas soportados | Catalán (ca), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

Gala parte de Qwen/Qwen3.5-0.8B, un transformer multimodal con torre de visión. El ajuste fino se aplicó exclusivamente al modelo de lenguaje: los 192 módulos entrenados son proyecciones del LM, y la torre de visión quedó intacta. Se empleó LoRA con rango 16, α=32 y dropout 0.05, fusionado en los pesos completos antes de la publicación. El entrenamiento usó pérdida solo sobre turnos del asistente, empaquetado a 2.048 tokens, 2 épocas y 350 pasos.

El conjunto de datos consta de 43.478 conversaciones: 35.000 del segmento catalán de BSC-LT/ALIA-2606-SFT (la mezcla SFT detrás de ALIA-40b-instruct), 7.122 filas de entrenamiento de projecte-aina/MentorCA convertidas a turnos de chat y 1.750 anclas en inglés (aproximadamente el 4%). Se excluyó deliberadamente InstruCAT por su licencia CC-BY-NC-ND. El entrenamiento se ejecutó en una única T4 con fp16 y el kernel `flash-linear-attention` activo, durante 21 horas y 22 minutos. La pérdida de entrenamiento final pasó de 1,496 a 1,074; la pérdida de evaluación sobre la validación de MentorCA fue de 1,339, con una precisión de token del 72,6%.

## Capacidades

- Generación de texto conversacional en catalán e inglés, con especial énfasis en turnos cortos de chat.
- Seguimiento de instrucciones en catalán, con mejora medible en IFEval_ca respecto al modelo base.
- Razonamiento de sentido común y conocimiento cultural catalán (mejoras en COPA-ca y Tecla).
- Clasificación de noticias en cuatro vías (evaluado en Tecla).
- Razonamiento matemático básico en catalán (mgsm_ca), con mejora marginal.
- Capacidad multimodal heredada del modelo base (image-text-to-text), aunque no fue entrenada ni evaluada en este ajuste.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a catalán e inglés; no se documentan otros idiomas.

## Casos de uso

- Asistente conversacional catalán para demostraciones: el modelo puede mantener diálogos multi-turno en catalán con un estilo más natural que el base, adecuado para prototipos y demos interactivas donde no se exige precisión factual estricta.
- Seguimiento de instrucciones en catalán: útil para tareas de formato y restricciones de salida (por ejemplo, generar respuestas con estructura fija), donde Gala supera al base en IFEval_ca (41,3% frente a 32,7%).
- Clasificación temática de noticias en catalán: con un 44,3% en la clasificación de cuatro vías de Tecla frente al 25,3% del base, puede emplearse como clasificador ligero en pipelines de medios o agregadores catalanes.
- Razonamiento de sentido común para filtrado o moderación asistida: la mejora en COPA-ca (64,0% frente a 54,0%) permite usarlo en tareas de elección entre alternativas plausibles, siempre con revisión humana.
- Preguntas de opción múltiple educativas en catalán: adecuado para generar o resolver ítems de cultura general y ciencia a nivel básico (arc_ca), con resultados moderados que requieren validación.
- Experimentación académica sobre ajuste fino de modelos pequeños: el modelo y su receta (LoRA r=16, datos ALIA y MentorCA, T4 única) sirven como referencia reproducible para investigar SFT en lenguas de recursos medios.
- Base para futuros ajustes catalanes: al estar bajo Apache-2.0 y en safetensors, puede reutilizarse como punto de partida para fine-tunings posteriores con datos propios.

## Benchmarks y rendimiento

Evaluación generativa con parseo de letras para opción múltiple, decodificación muestreada (temperatura 0,7, top_p 0,9, penalización de repetición 1,1). Comparación con el modelo base Qwen3.5-0.8B:

| Benchmark | Gala | Base | Δ |
|---|---|---|---|
| IFEval_ca (strict acc, subconjunto de 150 prompts) | 41,3% | 32,7% | +8,7 |
| hhh_alignment_ca (overall) | 15,8% | 10,4% | +5,4 |
| Tecla (clasificación de noticias en 4 vías, n=300) | 44,3% | 25,3% | +19,0 |
| COPA-ca (n=500) | 64,0% | 54,0% | +10,0 |
| arc_ca Easy (n=300) | 64,7% | 59,3% | +5,3 |
| arc_ca Challenge (n=300) | 55,7% | 54,0% | +1,7 |
| mgsm_ca (n=250) | 23,6% | 22,4% | +1,2 |
| EQ-bench_ca (MAE 0–10, menor es mejor) | 2,96 | 3,35 | −0,39 |
| CaBBQ (overall, n=400) | 41,5% | 45,0% | −3,5 |
| xquad-ca (F1, n=300) | 37,9 | 56,1 | −18,2 |

Gala mejora al base en 7 de las 10 mediciones reportadas, con las mayores ganancias en conocimiento cultural catalán (Tecla), sentido común (COPA) y seguimiento de instrucciones (IFEval_ca). Retrocede en CaBBQ y de forma notable en xquad-ca.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 853 millones de parámetros, en fp16 requiere aproximadamente 1,7 GB de pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits o 4 bits el consumo sería considerablemente menor, aunque no se publican pesos cuantizados en esta ficha.
- GPU recomendadas: el modelo cabe holgadamente en GPUs de consumo. Una RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070 o RTX 4090 son suficientes para inferencia en fp16. Para entrenamiento, el autor usó una única T4.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 4-6 GB de VRAM en fp16, y en configuraciones aún menores con cuantización.
- Opciones de despliegue: transformers (librería declarada). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles. El entrenamiento se completó en 21 h 22 m en una T4 con fp16 y el kernel `flash-linear-attention`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gala | 853 M | No disponible | Chat catalán (SFT sobre Qwen3.5-0.8B) | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.5-0.8B (base) | 853 M | No disponible | Multimodal generalista | Apache-2.0 | HuggingFace |
| MiniCPM5-2B-catalan-chat-v2 (mismo autor) | 2,5 B | No disponible | Chat catalán multi-turno | No disponible en la información | HuggingFace y GGUF |
| MiniCPM5-2B-catalan-chat (mismo autor) | 2,5 B | No disponible | SFT de instrucciones sobre InstruCAT | No disponible en la información | HuggingFace y GGUF |

La comparación directa con el base es la más relevante: Gala mejora en instrucciones, alineación y conocimiento cultural catalán, pero pierde en extracción de respuestas (xquad-ca) y ligeramente en sesgos (CaBBQ). Frente a los modelos de 2,5 B del mismo autor, Gala es más pequeño y probablemente más rápido de desplegar, pero con menor capacidad absoluta; no se dispone de benchmarks comparativos entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Techo de fluidez: las generaciones largas en catalán aún contienen errores gramaticales, palabras inventadas y contenido alucinado, consecuencia de la escala de 0,8 B y de una receta solo SFT. Los turnos conversacionales cortos son notablemente más fiables que las generaciones extensas.
- Regresión en QA extractiva: en xquad-ca el F1 cae de 56,1 a 37,9 respecto al base; el estilo más conversacional perjudica las tareas de extracción de spans.
- Sesgos: CaBBQ baja de 45,0% a 41,5%; la sonda de sesgo de opción múltiple está cerca del azar en ambos modelos a esta escala y debe interpretarse con cautela.
- Ruido de evaluación: ambos modelos se evaluaron con el mismo harness, pero el parseo de letras en opción múltiple en modelos pequeños añade ruido a todas las cifras absolutas.
- Multimodalidad no validada: el comportamiento de visión se hereda del base y no fue ajustado ni evaluado; no debe asumirse su calidad.
- Licencia: Apache-2.0 permite uso comercial, pero los datos de entrenamiento tienen licencias propias (ALIA-2606-SFT CC-BY-4.0, MentorCA CC-BY-SA-4.0); conviene revisar obligaciones de atribución y compartir-igual derivadas de los datos.
- Uso en producción: el autor no lo recomienda para uso factual en producción sin salvaguardas; requiere verificación humana en contextos sensibles.
- Idiomas: solo catalán e inglés; no se garantiza un comportamiento correcto en otras lenguas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/luispoveda93/Gala
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset ALIA-2606-SFT: https://huggingface.co/datasets/BSC-LT/ALIA-2606-SFT
- Dataset MentorCA: https://huggingface.co/datasets/projecte-aina/MentorCA
- Dataset InstruCAT (excluido del entrenamiento): https://huggingface.co/datasets/projecte-aina/InstruCAT
- Informe del proyecto (repo privado): https://huggingface.co/luispoveda93/Gala-project-report
- Dashboard de entrenamiento: https://huggingface.co/spaces/luispoveda93/gala-catalan-sft-trackio
- MiniCPM5-2B-catalan-chat-v2: https://huggingface.co/luispoveda93/MiniCPM5-2B-catalan-chat-v2
- MiniCPM5-2B-catalan-chat-v2 GGUF: https://huggingface.co/luispoveda93/MiniCPM5-2B-catalan-chat-v2-GGUF
- MiniCPM5-2B-catalan-chat: https://huggingface.co/luispoveda93/MiniCPM5-2B-catalan-chat
- MiniCPM5-2B-catalan-chat GGUF: https://huggingface.co/luispoveda93/MiniCPM5-2B-catalan-chat-GGUF
- Benchmark IFEval_ca: https://huggingface.co/datasets/projecte-aina/IFEval_ca
- Benchmark hhh_alignment_ca: https://huggingface.co/datasets/projecte-aina/hhh_alignment_ca
- Benchmark Tecla: https://huggingface.co/datasets/projecte-aina/tecla
- Benchmark COPA-ca: https://huggingface.co/datasets/projecte-aina/COPA-ca
- Benchmark arc_ca: https://huggingface.co/datasets/projecte-aina/arc_ca
- Benchmark mgsm_ca: https://huggingface.co/datasets/projecte-aina/mgsm_ca
- Benchmark EQ-bench_ca: https://huggingface.co/datasets/BSC-LT/EQ-bench_ca
- Benchmark CaBBQ: https://huggingface.co/datasets/BSC-LT/CaBBQ
- Benchmark xquad-ca: https://huggingface.co/datasets/projecte-aina/xquad-ca
