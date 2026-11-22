# dimitarpg13/semsimula-ladder-owt-d384-l2-none

## Resumen

semsimula-ladder-owt-d384-l2-none es un modelo de lenguaje de investigación desarrollado por el usuario independiente dimitarpg13 dentro del proyecto SemSimula. No es un transformer: se trata de un modelo de lenguaje conservativo (conservative-language-model) de tipo energy-based, formulado con mecánica lagrangiana y un potencial gaussiano anisotrópico, que sustituye la atención por dinámicas de fuerzas derivadas de un potencial escalar. Forma parte de la "Generación 2" de una escalera de ablación de mecanismos (mechanism ladder) entrenada sobre OpenWebText con presupuesto de tokens idéntico entre brazos.

El modelo tiene d=384 y L=2 (dos capas), sin campo de intercambio (arm "no-exchange"), y se entrenó con las fuentes de Vφ y ξ desconectadas del grafo de gradientes (convención "detached"). Alcanza una perplejidad de validación de 66,98 en OpenWebText a bloque 512, frente a 49,81 de un GPT-2 emparejado en parámetros y tokens. Su relevancia es fundamentalmente metodológica: sirve como control pareado para aislar el coste de mecanismos concretos (campo de intercambio, conservatividad, mecanismo de Fock) en arquitecturas no-transformer.

La propia model card advierte que esta generación está superada: al reentrenar con gradientes vivos, el mismo brazo baja de 66,98 a 53,12 de perplejidad, por lo que las lecturas de esta cifra como "precio del mecanismo" quedan retiradas. El modelo se mantiene como control emparejado de la escalera, no como modelo de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conservative language model (Fock-PARFLM), energy-based, physics-informed, sin atención, no-transformer |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado y evaluado a bloque de 512 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (librería pytorch); repo de 0,6 GB |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Fock-PARFLM (Parallel Register Field Language Model), una arquitectura sin atención que modela la generación de tokens mediante dinámicas de fuerzas. Incorpora un potencial escalar φ con forma gaussiana anisotrópica, un campo de intercambio (exchange field) opcional y un mecanismo de "registros virtuales" (virtual registers) con un canal inverso (reverse-channel). La integración se realiza con esquemas de dinámica molecular (cFc y BAOAB) sobre una geometría riemanniana con métrica de Jacobi, lo que da lugar a una inferencia con memoria constante. Este brazo concreto elimina el campo de intercambio ("no-exchange"), de modo que la única vía de interacción entre tokens es el potencial conservativo.

El entrenamiento se realizó sobre Skylion007/openwebtext con un presupuesto fijado y emparejado entre todos los brazos de la escalera: 532.480.000 tokens (32.500 pasos × 32 × 512). La innovación metodológica clave es el diseño pre-registrado: cada brazo elimina exactamente un mecanismo, de modo que las diferencias de perplejidad aíslan componentes por construcción, no por atribución. En esta generación las fuentes de Vφ y ξ se desconectaron del gradiente (convención "detached"), lo que impide que la pérdida fluya hacia tokens anteriores por esos canales; la investigación posterior (Gradient Starvation Investigation) demuestra que mantener esos gradientes vivos mejora sustancialmente los resultados.

## Capacidades

- Generación de texto autorregresiva en inglés, con decodificación basada en dinámica de partículas en lugar de atención.
- Modelado de lenguaje con memoria constante en inferencia (constant-memory-inference), independiente de la longitud de contexto.
- Inferencia con coste de memoria fijo gracias a la formulación física sin matriz de atención.
- Capacidad de ablación controlada: cada checkpoint de la escalera permite medir el efecto de un mecanismo aislado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales: ninguna documentada (sin visión, audio ni modo thinking).

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: sirve como punto de comparación controlado para medir el coste de prescindir de la atención en igualdad de parámetros, tokens y corpus.
- Ablación de mecanismos físicos: al eliminar solo el campo de intercambio, permite cuantificar su contribución (63,51 → 66,98 de perplejidad) frente al brazo con campo activo.
- Estudio de conservatividad en modelos generativos: comparado con el brazo "attention_potential" y el control "conservative-only", aísla el efecto de imponer que las fuerzas deriven de un potencial escalar.
- Reproducibilidad metodológica: el diseño pre-registrado y el presupuesto de tokens idéntico lo convierten en material útil para replicar estudios de ablación con rigor estadístico.
- Docencia e investigación sobre modelos energy-based: ilustra cómo se formula un LM como sistema dinámico con potencial, registros virtuales y canal inverso.
- Referencia para inferencia de memoria constante: útil en entornos con restricciones de memoria donde se quiera estudiar el compromiso entre calidad y coste fijo.
- Control negativo en evaluación de la Generación 3: permite medir la mejora atribuible a los gradientes vivos (66,98 → 53,12) con el mismo forward pass.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados) sobre OpenWebText, split de validación:

| Métrica | Valor |
|---|---|
| Perplejidad de validación (bloque 512, asentada; media de las tres últimas evaluaciones de 500 pasos) | 66,98 |

Comparativa interna de la escalera (misma arquitectura, mismo presupuesto de 532.480.000 tokens):

| Brazo | Mecanismo eliminado | PPL asentada | Ratio vs GPT-2 |
|---|---|---:|---:|
| GPT-2 emparejado (baseline) | la arquitectura de referencia | 49,81 | 1,000× |
| Fock-PARFLM, campo de intercambio activo | el transformer | 63,51 | 1,275× |
| Fock-PARFLM, campo como potencial | parte no conservativa del campo | 80,90 | 1,624× |
| Fock-PARFLM, sin campo de intercambio (este modelo) | el campo de intercambio | 66,98 | 1,345× |
| Control solo conservativo (Fock desactivado) | el mecanismo de Fock | 87,93 | 1,765× |

Diferencias medidas: el transformer supera a este brazo en +13,70 PPL (+27,5%); eliminar el campo de intercambio cuesta +3,47 PPL (+5,5%) respecto al brazo con campo; un campo conservativo sobre ninguno cuesta +13,92 PPL (+20,8%). Con gradientes vivos, este mismo brazo alcanza 53,12 de perplejidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repo pesa 0,6 GB, lo que sugiere que los pesos en fp32 caben holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no disponible. Por tamaño (d=384, L=2), cualquier GPU con al menos unos pocos GB de VRAM debería ser suficiente.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del checkpoint, aunque no hay requisitos publicados.
- Opciones de despliegue: no disponible; la librería declarada es PyTorch puro, sin integración documentada con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La arquitectura promete memoria constante en inferencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PPL OpenWebText (bloque 512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| semsimula-ladder-owt-d384-l2-none (este) | no disponible (d=384, L=2) | no disponible (entrenado a 512) | 66,98 | CC-BY-4.0 | Hugging Face |
| semsimula-ladder-owt-d384-l2-attention | no disponible (d=384, L=2) | no disponible (entrenado a 512) | 63,51 | CC-BY-4.0 | Hugging Face |
| semsimula-ladder-owt-d384-l2-gpt2-matched | no disponible (d=384, L=2) | no disponible (entrenado a 512) | 49,81 | CC-BY-4.0 | Hugging Face |
| semsimula-ladder-owt-d384-l2-none-norc | no disponible (d=384, L=2) | no disponible (entrenado a 512) | 87,93 | CC-BY-4.0 | Hugging Face |

No se dispone de comparación con modelos de la literatura general (GPT-2 estándar, Pythia, etc.) en las mismas condiciones; los únicos datos comparables son los brazos internos de la escalera SemSimula.

## Limitaciones y advertencias

- Modelo de investigación superado: la propia model card lo marca como "Generation 2 of 3: superseded", conservado solo como control pareado.
- Convención "detached" en el entrenamiento: los gradientes no fluyen hacia tokens anteriores por los canales de Vφ y ξ, lo que degrada el rendimiento (66,98 frente a 53,12 con gradientes vivos).
- Las lecturas de la perplejidad como "precio del mecanismo de Fock" o "precio de la conservatividad" están explícitamente retiradas por el autor.
- Solo inglés; sin capacidades multilingües documentadas.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso.
- Riesgo de alucinación: no evaluado; un modelo de 384 dimensiones y 2 capas entrenado con ~532M tokens tiene capacidad limitada y probablemente una coherencia superficial.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el modelo no está pensado ni validado para producción.
- Sin cuantizaciones publicadas ni integración con runtimes de inferencia estándar; requiere código propio del proyecto.
- Sesgos: no documentados, pero el corpus OpenWebText hereda los sesgos de Reddit.
- No hay resultados de benchmarks más allá de la perplejidad; no se han publicado evaluaciones en MMLU, HumanEval, GSM8K ni similares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-none
- Brazo con campo de intercambio: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention
- Brazo con campo como potencial: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention-potential
- Brazo con gradientes vivos (probe): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention-potential-rglive
- Versión con todos los caminos vivos: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-attention-potential
- Versión con gradientes vivos de este brazo: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none
- Control solo conservativo: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-none-norc
- Control solo conservativo con gradientes vivos: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc
- Baseline GPT-2 emparejado: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Colección Generación 3: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Notas sobre el agotamiento de gradientes: https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/Gradient_Starvation_Investigation.md
- Repositorio del paper: https://github.com/dimitarpg13/semsimula-paper
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
