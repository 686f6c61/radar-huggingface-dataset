# MohammadKhosravi/llama3.1-8b-pure-pmt-6k

## Resumen

Este modelo es un fine-tuning experimental de Llama 3.1 8B Instruct creado por MohammadKhosravi. Implementa una variante de PrefixMemory-Tuning (PMT) no comprimida, una técnica que incorpora una matriz de memoria externa al transformer para condicionar la generación de texto mediante instrucciones textuales. El objetivo es alinear el modelo con los niveles de competencia lingüística del marco común europeo (CEFR), permitiendo controlar la dificultad del inglés generado.

La arquitectura añade un módulo de memoria parametrizado por una matriz de 4096×4096 y un mapa de características ELU aplicado a las consultas, lo que supone aproximadamente 536,8 millones de parámetros adicionales. Se trata de una variante "vanilla" sin mecanismos internos de gating para CEFR, de modo que el control del nivel se ejerce únicamente a través del prompt textual. El modelo base es Llama 3.1 8B Instruct, con licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con módulo PrefixMemory-Tuning (PMT) no comprimido |
| Parametros totales | ≈ 8.5B (8B de Llama 3.1 + 536.8M del módulo PMT) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.1 8B Instruct y añade un módulo de memoria externa de 536.8 millones de parámetros. Según la model card, el módulo PMT se reubica fuera de la cabeza de atención, desacoplándolo del normalizado softmax. La memoria se parametriza como una matriz M ∈ R^{4096×4096} y se aplica un mapa de características ELU φ(Q) directamente sobre la representación de las consultas. El factor de escala α se absorbe en la matriz M. No existe ningún mecanismo de gating específico para CEFR ni embeddings diferenciados; el control del nivel se transfiere completamente al prompt textual.

El entrenamiento utiliza una pérdida estándar de entropía cruzada para modelado de lenguaje causal sobre tokens objetivo equilibrados, con los tokens del prompt enmascarados con -100. Se entrenó durante 3 epochs, con una pérdida de entrenamiento final de 5.1446 y una perplejidad de validación de 185.96. El autor reporta un tiempo total de entrenamiento de 1816.52 segundos (0.50 horas), un pico de memoria GPU de 46.30 GB y una utilización media de GPU del 97.2%.

## Capacidades

- Generación de texto condicionada por instrucciones textuales de nivel CEFR: el modelo interpreta la consigna con el nivel deseado (por ejemplo, "escribe un párrafo de nivel B2") y ajusta la dificultad léxica y sintáctica del texto generado.
- Alineación de proficiencia lingüística: busca producir texto que se corresponda con el nivel de referencia europeo, sin necesidad de un mecanismo interno de gating.
- Hereda las capacidades del modelo base Llama 3.1 8B Instruct en cuanto a razonamiento, código y diálogo; sin embargo, este comportamiento no está documentado en la información disponible.
- No se especifica soporte de tool calling, visión o audio en los datos publicados.
- Es un baseline de investigación, no un modelo de propósito general optimizado para tareas amplias.

## Casos de uso

- Materiales didácticos de inglés: un profesor puede solicitar al modelo un texto de nivel B1 para un ejercicio de lectura. Al incluir la instrucción textual con el nivel CEFR, el modelo genera un texto adaptado a esa competencia.
- Adaptación de textos para editoriales: una editorial puede usar el modelo para reescribir un artículo en distintos niveles (por ejemplo, de C1 a A2) con el fin de llegar a lectores de diferentes perfiles.
- Evaluación automatizada de nivel: dado que el modelo está alineado a CEFR, se puede utilizar para generar textos de referencia y compararlos con muestras de estudiantes, como apoyo en la evaluación de dificultad.
- Tutorías interactivas de inglés: un chatbot tutor puede ajustar dinámicamente el lenguaje de sus respuestas al nivel del estudiante cambiando la instrucción en cada turno, aprovechando que el control es puramente textual.
- Investigación en PrefixMemory-Tuning: los investigadores pueden usar este baseline para comparar variantes con gating CEFR, datasets curados u otros diseños de memoria, tal como hace el propio autor.
- Generación de ejercicios de vocabulario y gramática: el modelo puede producir frases de ejemplo para un nivel concreto, útiles en aplicaciones de aprendizaje de idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor solo reporta las métricas de entrenamiento siguientes:

| Epoch | Train loss | Val loss | Val PPL |
|---|---|---|---|
| 1 | 6.1827 | 5.5490 | 256.97 |
| 2 | 5.3515 | 5.2795 | 196.26 |
| 3 | 5.1446 | 5.2255 | 185.96 |

Estos valores reflejan la pérdida de entropía cruzada durante el fine-tuning, no una evaluación de calidad de tarea. No se dispone de más datos.

## Requisitos de hardware

- VRAM para inferencia: no disponible en la información publicada. Durante el entrenamiento se alcanzó un pico de 46.30 GB de VRAM.
- GPU recomendada: no disponible. El entrenamiento se realizó en una GPU con al menos 46.30 GB de memoria, lo que apunta a una A100 80GB o similar, pero no se especifica.
- Cabe en GPU de consumo: no disponible. A priori, un modelo de 8B con cuantización 4-bit podría caber en una RTX 4090, pero no hay información sobre las cuantizaciones ofrecidas.
- Opciones de despliegue: no se especifican en la documentación. Al estar basado en Llama 3.1, podría ser compatible con frameworks como vLLM, llama.cpp, Ollama o TGI, siempre que los pesos estén en el formato adecuado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Técnica | Dataset | Licencia |
|---|---|---|---|---|
| llama3.1-8b-pure-pmt-6k | Llama 3.1 8B Instruct | PMT sin gating | No especificado | Apache 2.0 |
| llama3.1-8b-pure-pmt-cefr-gating-no-cefr-cues | Llama 3.1 8B Instruct | PMT con gating CEFR, sin señales CEFR en prompt | No especificado | Apache 2.0 |
| llama3.1-8b-pure-pmt-cefr-gating-curated6k | Llama 3.1 8B Instruct | PMT con gating y dataset curado | PCA-curated 6000 muestras | Apache 2.0 |

No se han publicado parámetros, longitud de contexto ni resultados de benchmarks para estos modelos en las fuentes consultadas.

## Limitaciones y advertencias

- Es un baseline experimental, no un modelo de producción. El propio autor lo describe como "vanilla uncompressed PMT baseline".
- La perplejidad de validación final (185.96) es alta en comparación con lo habitual en modelos de lenguaje modernos de 8B. Esto sugiere que el fine-tuning no optimiza la fluidez, sino el control de nivel, y puede producir texto poco natural.
- No se han realizado evaluaciones de seguridad, sesgos o alucinaciones. El modelo base Llama 3.1 puede heredar sesgos conocidos.
- La información disponible no especifica los idiomas soportados. Aunque el modelo base es multilingüe, el entrenamiento se centra en inglés (CEFR), por lo que su rendimiento en otros idiomas es dudoso.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar la atribución y el aviso de licencia.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un experimento de investigación con poca validación externa.
- No hay información sobre soporte de herramientas externas (tool calling), visión o audio.

## Enlaces

- https://huggingface.co/MohammadKhosravi/llama3.1-8b-pure-pmt-6k
- https://huggingface.co/MohammadKhosravi/llama3.1-8b-pure-pmt-cefr-gating-no-cefr-cues
- https://huggingface.co/MohammadKhosravi/llama3.1-8b-pure-pmt-cefr-gating-curated6k
