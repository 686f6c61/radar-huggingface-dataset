# dendriteholdings/Ingot-V-27B-Q2

## Resumen

Ingot-V-27B-Q2 es un modelo de lenguaje de 26.896 millones de parámetros distribuido en formato GGUF y derivado de Prism ML Ternary Bonsai 2 27B. No es un entrenamiento desde cero ni un ajuste fino convencional: es una copia cuantizada a ternario cuyos códigos ternarios provienen del modelo base, mientras que las escalas por bloque y los pesos de normalización han sido reajustados por un minero de la subred Ingot de Bittensor. El objetivo declarado de esa subred es producir la cuantización que más se aproxime al profesor original en BF16, medido mediante divergencia KL y distancia de estados ocultos.

El resultado es un artefacto pensado para inferencia local y despliegue con llama.cpp, con un tamaño de repositorio de 7,2 GB que refleja la compresión agresiva del esquema ternario. La relevancia actual del modelo es doble: por un lado, demuestra que la optimización de escalas en cuantizaciones de muy baja precisión puede acercar la distribución de salida al profesor sin tocar los códigos; por otro, ejemplifica un flujo de trabajo descentralizado donde la evaluación comparativa contra un profesor actúa como mecanismo de consenso.

Conviene subrayar que el modelo no funciona con llama.cpp estándar. Requiere un fork específico de PrismML fijado a un commit concreto, lo que condiciona su adopción en producción. Además, la model card no documenta idiomas soportados, licencia ni resultados de benchmarks convencionales como MMLU o HumanEval.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Ternary Bonsai 2 27B), pesos ternarios con escalas por bloque |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria (Q2/PQ2) en GGUF; drafter especulativo DFlash2 en Q8_0; proyector vision en Q8_0 y BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); pack MLX 2-bit disponible por separado |

## Arquitectura y entrenamiento

El modelo parte de Prism ML Ternary Bonsai 2 27B, un transformer de aproximadamente 27.000 millones de parámetros cuantizado a representación ternaria. La intervención del minero no modifica los códigos ternarios: conserva los del modelo base y reajusta las escalas por bloque y los pesos de normalización para reducir la divergencia respecto al profesor Qwen3.8-27B en BF16. El archivo `Ingot-V-27B-PQ2_0.gguf` mantiene el layout, el tokenizer y la rotación de Hadamard de `dendriteholdings/Ingot-genesis-27B-Q2`, lo que explica la dependencia de un fork concreto de llama.cpp.

No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La evaluación del minero se basa en dos métricas calculadas token a token contra el profesor: la divergencia KL entre distribuciones del siguiente token (0,11057) y la distancia relativa de estados ocultos promediada cada 8 capas (0,3436). El modelo superó al rey vigente en la misma evaluación, que obtuvo 0,11227 y 0,3565 respectivamente. Como innovación operativa, la familia cuenta con un drafter de decodificación especulativa DFlash2 que propone varios tokens por paso y acelera la generación aproximadamente 1,8x en chat greedy mono-stream y 1,3-1,4x con sampling, a cambio de unos 6 GB adicionales de VRAM.

## Capacidades

- Generación de texto conversacional, con etiqueta `conversational` en el repositorio y soporte de plantilla Jinja mediante `--jinja`.
- Razonamiento y generación de código heredados del modelo base, aunque sin benchmarks publicados que los cuantifiquen.
- Entrada de imágenes opcional mediante el proyector multimodal de Ternary Bonsai 2 (`mmproj` en Q8_0 o BF16), con calidad no verificada para estos pesos.
- Decodificación especulativa mediante el drafter DFlash2, con verificación de tokens por el modelo principal.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue como servicio.
- Capacidades multilingües: no disponibles en la documentación.
- Tool calling y razonamiento multi-paso en agentes: no documentados explícitamente para esta variante.

## Casos de uso

- Inferencia local en estaciones de trabajo con GPU de consumo: el empaquetado ternario de 7,2 GB permite ejecutar un modelo de 27B en hardware donde un BF16 equivalente no cabría, usando el fork de PrismML con `-ngl 99 -fa on`.
- Chat conversacional de baja latencia en single-stream: combinado con el drafter DFlash2 en modo greedy, se obtiene aproximadamente 1,8x de velocidad de decodificación, adecuado para asistentes interactivos.
- Servicio de generación de texto autohospedado: el tag `endpoints_compatible` y el servidor `llama-server` permiten exponer una API compatible con clientes OpenAI sobre los pesos cuantizados.
- Experimentación en cuantización de baja precisión: sirve como caso de estudio reproducible para medir el impacto del reajuste de escalas y normas sobre la fidelidad al profesor mediante KL y distancia de estados ocultos.
- Investigación en ecosistemas descentralizados: útil para analizar cómo un mecanismo de validación basado en proximidad al profesor selecciona artefactos y qué compromisos introduce frente a una cuantización estándar.
- Prototipado multimodal con imágenes: añadiendo el `mmproj` de Ternary Bonsai 2 se puede probar entrada visual en pipelines de descripción o extracción, asumiendo que la calidad no está garantizada para estos pesos.
- Despliegue en Apple Silicon: existe un pack MLX 2-bit separado (`Ingot-V-27B-MLX-2bit`) para equipos con chip de Apple, útil en flujos de desarrollo sin GPU NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible. La única evaluación documentada es la fidelidad al profesor:

| Metrica | Este modelo | Rey anterior en la misma eval |
|---|---|---|
| KL(profesor ‖ modelo) por token | 0,11057 | 0,11227 |
| Distancia de estados ocultos (cada 8 capas) | 0,3436 | 0,3565 |

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF ocupa 7,2 GB, por lo que con overhead de contexto y buffers de atención se sitúa aproximadamente entre 8 y 10 GB en configuraciones típicas; el dato exacto no está documentado.
- Con decodificación especulativa DFlash2 hay que sumar unos 6 GB adicionales de VRAM para el drafter Q8_0.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabe en RTX 4090 (24 GB) y en GPUs de 16 GB con margen; para el drafter conviene disponer de 24 GB o más.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4080/4090 y equivalentes con 16 GB o más, siempre que se use el fork compatible.
- Opciones de despliegue: exclusivamente el fork de PrismML de llama.cpp en el commit `e3de715222b2667c54a267441159a5729f11155e`; llama.cpp estándar no ejecuta el archivo. Para Apple Silicon existe el pack MLX 2-bit.
- Latencia y throughput: no documentados en valores absolutos; solo se indica la mejora relativa del drafter (1,8x en greedy, 1,3-1,4x con sampling).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ingot-V-27B-Q2 | 26,9B | no disponible | GGUF ternario | no disponible | Requiere fork de llama.cpp; fidelidad al profesor KL 0,11057 |
| prism-ml/Ternary-Bonsai-2-27B-gguf | ~27B | no disponible | GGUF ternario | no disponible | Modelo base; incluye torre de visión oficial |
| dendriteholdings/Ingot-genesis-27B-Q2 | ~27B | no disponible | GGUF ternario | no disponible | Mismo layout, tokenizer y rotación Hadamard; referencia de compatibilidad |
| dendriteholdings/Ingot-V-27B-MLX-2bit | ~27B | no disponible | MLX 2-bit | no disponible | Mismos pesos para Apple Silicon |

## Limitaciones y advertencias

- Dependencia de un fork no estándar de llama.cpp fijado a un commit concreto; cualquier actualización del upstream puede romper la compatibilidad.
- Licencia no disponible: no puede asumirse uso comercial sin verificar los términos del modelo base y del repositorio.
- Idiomas soportados no documentados, lo que impide garantizar calidad fuera del inglés o de los idiomas del profesor.
- Longitud de contexto no especificada; planificar despliegues con contexto largo requiere validación empírica previa.
- La cuantización ternaria introduce degradación respecto al profesor; la métrica KL de 0,11057 cuantifica esa brecha, no la elimina.
- La evaluación multimodal con el `mmproj` de Bonsai 2 no está probada para estos pesos y el autor advierte que el proyector se creó para genesis.
- Riesgo de alucinación inherente a modelos de 27B cuantizados, agravado por la ausencia de benchmarks de conocimiento y razonamiento.
- Sesgos no evaluados ni documentados en la model card.
- El modelo es un artefacto de competición: su valor está en la proximidad al profesor medida por el validador, no en un conjunto amplio de evaluaciones de capacidad.

## Enlaces

- Hugging Face: https://huggingface.co/dendriteholdings/Ingot-V-27B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo de referencia de layout: https://huggingface.co/dendriteholdings/Ingot-genesis-27B-Q2
- Drafter especulativo: https://huggingface.co/dendriteholdings/Ingot-27B-DFlash2
- Pack MLX 2-bit: https://huggingface.co/dendriteholdings/Ingot-V-27B-MLX-2bit
- Fork de llama.cpp: https://github.com/PrismML-Eng/llama.cpp
- Commit requerido: https://github.com/PrismML-Eng/llama.cpp/commit/e3de715222b2667c54a267441159a5729f11155e
- Proyector visión Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-Q8_0.gguf
- Proyector visión BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/b072e1d3b35a0a630cece372c2127528e0994386/Ternary-Bonsai-2-27B-mmproj-BF16.gguf
