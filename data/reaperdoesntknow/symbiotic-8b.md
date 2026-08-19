# reaperdoesntknow/Symbiotic-8B

## Resumen

Symbiotic-8B (también denominado SymbioticLM-8B) es un modelo de generación de texto híbrido que combina un transformer de 8.000 millones de parámetros basado en Qwen3-8B con módulos simbólicos adicionales y un buffer de memoria persistente. Ha sido desarrollado por reaperdoesntknow, del laboratorio Convergent Intelligence LLC, dentro de su serie Symbiotic AI. Su objetivo declarado es dotar al modelo de capacidades de razonamiento simbólico a largo plazo, como generación de teoremas, encadenamiento lógico y razonamiento estructurado con retención de memoria entre turnos, algo que los transformers convencionales no abordan de forma explícita.

El modelo incorpora cuatro módulos simbólicos (ThoughtDynamicsLNN, CrystallineProcessor, LiquidThoughtProcessor y HelicalDNAProcessor) junto con un buffer de 2048 vectores simbólicos en float32 con recuperación basada en entropía. Está entrenado sobre el dataset 0xZee/dataset-CoT-Advanced-Calculus-268, especializado en cálculo avanzado con cadenas de razonamiento. A pesar de su nombre, no es un modelo fine-tuning convencional: la model card indica que no está ajustado para instrucciones (instruction-tuned) y que requiere ingeniería de prompts para tareas de chat. Su relevancia actual radica en ser un intento de integrar procesamiento simbólico explícito dentro de un transformer de propósito general, aunque su adopción práctica es limitada por la falta de benchmarks publicados y de documentación detallada de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con módulos simbólicos (backbone Qwen3-8B + ThoughtDynamicsLNN, CrystallineProcessor, LiquidThoughtProcessor, HelicalDNAProcessor) |
| Parametros totales | 8.190.735.360 (8B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredado de Qwen3-8B, no especificado en la documentación) |
| Tipos de cuantizacion | no disponible (el repositorio incluye model.safetensors y model.bin, sin precisión especificada) |
| Idiomas soportados | en (inglés) |
| Licencia | afl-3.0 (Academic Free License v3.0) |
| Formato de pesos | safetensors, también model.bin (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura combina un transformer rotatorio de 8B parámetros (Qwen3-8B) con cuatro módulos simbólicos adicionales: ThoughtDynamicsLNN (atención LSTM multi-cabeza), CrystallineProcessor (GNN tipo DNAConv), LiquidThoughtProcessor (plegado simbólico recurrente) y HelicalDNAProcessor (proyección lineal helicoidal). El modelo incluye además un buffer de memoria de 2048 vectores simbólicos en float32 con recuperación basada en entropía y un "Dream Mode" que genera cognición simbólica offline. Según la model card, la memoria debe ser sembrada activamente durante la inferencia.

El entrenamiento se realizó sobre el dataset 0xZee/dataset-CoT-Advanced-Calculus-268, que contiene cadenas de razonamiento para cálculo avanzado. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni el uso de técnicas como RLHF o DPO. El modelo se enmarca en la metodología Discrepancy Calculus (DISC) del laboratorio, que trata las singularidades del entrenamiento (plateaus de pérdida, colapso de modos, olvido catastrófico) como señales estructurales, aunque no se detalla cómo se aplicó esta metodología al entrenamiento concreto del modelo.

## Capacidades

- Razonamiento simbólico: generación de teoremas, demostraciones y encadenamiento lógico, según la model card.
- Memoria persistente entre turnos: buffer de 2048 vectores simbólicos que permite retener información contextual en diálogos largos.
- Razonamiento estructurado: soporte para tareas que requieren pasos lógicos explícitos, como pruebas matemáticas.
- Generación de texto general: al estar basado en Qwen3-8B, mantiene capacidades de generación de lenguaje natural, aunque no está ajustado para instrucciones.
- Modelado de código y pruebas matemáticas: indicado en la model card como caso de uso previsto.
- Diálogo con persistencia de contexto: puede mantener el hilo de una conversación gracias al buffer de memoria, siempre que se siembre adecuadamente.
- No se menciona soporte explícito para tool calling, function calling, ni capacidades multimodales (visión, audio).

## Casos de uso

- Tutoría de matemáticas con memoria de progreso: el buffer simbólico permite que el modelo recuerde ejercicios anteriores y el nivel del estudiante, generando explicaciones y demostraciones paso a paso. Adecuado por su entrenamiento en cálculo avanzado y su capacidad de retención entre turnos.
- Asistente de investigación en lógica formal: puede ayudar a construir cadenas de razonamiento y verificar pasos intermedios en demostraciones, gracias a los módulos simbólicos y al encadenamiento lógico declarado.
- Generación de pruebas matemáticas automatizadas: el modelo puede producir borradores de teoremas y demostraciones, útil para entornos educativos o de verificación formal, aunque requiere revisión humana.
- Sistema de diálogo con memoria de contexto en dominios técnicos: para aplicaciones donde el usuario necesita mantener un hilo de conversación largo sobre un tema concreto (p. ej., documentación técnica), el buffer de memoria evita perder referencias anteriores.
- Modelado de código con razonamiento simbólico: aunque no está específicamente entrenado para código, su base Qwen3-8B y los módulos simbólicos podrían emplearse en tareas de generación de código que requieran invariantes lógicas, siempre con prompts cuidadosamente diseñados.
- Prototipo de investigación en arquitecturas híbridas: sirve como banco de pruebas para evaluar si la integración de módulos simbólicos mejora el razonamiento en comparación con transformers estándar, aunque sin benchmarks publicados su utilidad es limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de 8B parámetros en precisión FP16, se requieren aproximadamente 16 GB de VRAM solo para los pesos; en INT8 serían unos 8 GB y en INT4 unos 4-5 GB. Sin embargo, no se especifica la precisión de los pesos publicados (el tamaño del repositorio de 43.1 GB sugiere FP32 o una combinación de archivos), por lo que estas cifras son orientativas.
- GPU recomendadas: para inferencia en FP16, una GPU con al menos 16 GB de VRAM (p. ej., RTX 4090, A100 40GB, H100). Para cuantizaciones más bajas, una RTX 3080/3090 de 10-24 GB podría ser suficiente.
- En consumer GPU: sí, es factible con cuantización INT4/INT8 en GPUs de gama alta (RTX 3090, RTX 4090), aunque el buffer de memoria simbólica adicional puede incrementar el uso de RAM/CPU.
- Opciones de despliegue: al ser compatible con transformers, puede servirse con vLLM, TGI o llama.cpp si se convierte a GGUF, aunque no se proporcionan archivos GGUF en el repositorio. También es posible usar Ollama si se genera un archivo de modelo adecuado.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

La comparativa se realiza con el modelo base Qwen3-8B y con otros modelos de 8B de propósito general, basándose en características conocidas y no en benchmarks (que no están disponibles).

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Symbiotic-8B | 8.19B | no disponible | AFL-3.0 | HuggingFace | Añade módulos simbólicos y memoria, pero sin benchmarks ni ajuste por instrucciones |
| Qwen3-8B (base) | 8.19B | 32K (según documentación de Qwen3) | Apache 2.0 | HuggingFace | Modelo base sin módulos simbólicos, con soporte de tool calling y razonamiento |
| Llama 3.1 8B | 8.03B | 128K | Llama 3.1 Community License | HuggingFace | Modelo de propósito general con amplio soporte de la comunidad |

La principal diferencia de Symbiotic-8B es su capa simbólica adicional y el buffer de memoria, pero carece de la madurez y el ecosistema de herramientas de los modelos base. Su licencia AFL-3.0 es menos permisiva que Apache 2.0 y puede imponer condiciones adicionales para uso comercial.

## Limitaciones y advertencias

- No está ajustado para instrucciones (instruction-tuned): los prompts de chat requieren ingeniería cuidadosa y es probable que el modelo no siga instrucciones de forma natural.
- Sin benchmarks publicados: no hay evidencia empírica de que los módulos simbólicos mejoren el rendimiento frente a Qwen3-8B u otros modelos.
- Buffer de memoria simbólica: la model card indica que debe ser "sembrado" activamente y que puede aumentar la carga de CPU; su comportamiento en producción no está documentado.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar contenido falso o inconsistente, especialmente en tareas de razonamiento simbólico donde no hay verificación externa.
- Idiomas: solo inglés declarado; no se garantiza un rendimiento adecuado en otros idiomas.
- Licencia AFL-3.0: es una licencia académica que permite uso comercial pero con condiciones (atribución, no garantía, limitación de responsabilidad). Conviene revisar sus términos antes de usarlo en productos comerciales.
- Documentación limitada: no se especifican detalles de entrenamiento (tokens, dataset completo, hiperparámetros) ni el impacto de los módulos simbólicos en el rendimiento.
- Posible incompatibilidad con herramientas estándar: al incluir archivos adicionales (memory.pt, tokens especiales como `<THM>`, `<PROOF>`, `<D_EPS>`), el modelo puede requerir código personalizado para cargar y ejecutar correctamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/reaperdoesntknow/Symbiotic-8B
- Portfolio de Convergent Intelligence: https://huggingface.co/reaperdoesntknow
- Discrepancy Calculus: Foundations and Core Theory: https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus (DOI: 10.57967/hf/8194)
- Structure Over Scale: https://huggingface.co/reaperdoesntknow/Structure-Over-Scale (DOI: 10.57967/hf/8165)
- Three Teachers to Dual Cognition: https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy (DOI: 10.57967/hf/8184)
- Modelos relacionados: Symbiotic-1B (https://huggingface.co/reaperdoesntknow/Symbiotic-1B), Symiotic-14B (https://huggingface.co/reaperdoesntknow/Symiotic-14B), Symbiotic-Beta (https://huggingface.co/reaperdoesntknow/Symbiotic-Beta)
