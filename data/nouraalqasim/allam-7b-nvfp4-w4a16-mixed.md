# NouraAlqasim/allam-7b-nvfp4-w4a16-mixed

## Resumen
El modelo `NouraAlqasim/allam-7b-nvfp4-w4a16-mixed` es una versión cuantizada del modelo `humain-ai/ALLaM-7B-Instruct-preview`, desarrollado por Noura Alqasim. Se trata de una cuantización post-entrenamiento con NVIDIA ModelOpt que utiliza pesos NVFP4 (E2M1, bloque 16) y activaciones en FP16 (modo W4A16). El objetivo principal es reducir el uso de memoria y acelerar la inferencia en GPUs con recursos limitados, manteniendo un comportamiento cercano al modelo original.

La cuantización se calibró con un conjunto de datos mixto (`calib3_mixed.txt`, 512 muestras de 512 tokens), pero las escalas de peso se calculan de forma independiente a los datos de calibración, ya que las activaciones quedan en FP16. Esto convierte al checkpoint en un control para comparar variantes con calibración AWQ. El modelo no es cargable con `transformers` directamente; requiere `vLLM` con la opción `--quantization modelopt_fp4`.

Este modelo es relevante para entornos de producción donde se necesita un LLM en árabe e inglés con un footprint de memoria reducido, especialmente en GPUs de consumo o en despliegues con vLLM. Aunque no se proporcionan métricas de rendimiento en la ficha, la cuantización W4A16 ofrece una buena relación entre compresión y calidad para tareas de generación de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: ALLaM-7B-Instruct-preview) |
| Parámetros totales | 3.762.556.928 (según safetensors) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (E2M1, bloque 16, escala E4M3 por bloque), activaciones FP16 (W4A16) |
| Idiomas soportados | no disponible (el modelo base ALLaM está orientado a árabe e inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors con cuantización NVFP4 (requiere vLLM con ModelOpt) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint `humain-ai/ALLaM-7B-Instruct-preview`, que pertenece a la familia ALLaM, desarrollada por SDAIA (Autoridad de Datos e IA de Arabia Saudí) y posteriormente gestionada por HUMAIN. ALLaM es un LLM entrenado desde cero para árabe e inglés, basado en una arquitectura transformer similar a Llama. No se proporcionan detalles sobre el entrenamiento original del modelo base en esta ficha.

La cuantización se realizó con NVIDIA ModelOpt (`NVFP4_DEFAULT_CFG`). Los pesos se cuantizaron a NVFP4 (formato E2M1 con escala E4M3 por bloque de 16), mientras que las activaciones se mantienen en FP16. La calibración se hizo con un dataset mixto, pero al no cuantizar las activaciones, las escalas de peso se calculan directamente de los pesos, sin influencia de los datos de calibración. Esto convierte al modelo en un control para medir el impacto de la calibración AWQ en otras variantes.

El checkpoint no es compatible con `transformers` estándar; su `config.json` declara el tipo de cuantización `modelopt`, por lo que se requiere `vLLM` para cargarlo y servirlo.

## Capacidades

- Generación de texto: el modelo base ALLaM-7B-Instruct-preview está diseñado para instrucciones y diálogo, por lo que esta cuantización hereda estas capacidades (aunque no se detallan en la ficha).
- Soporte multilingüe: el modelo base está entrenado en árabe e inglés, aunque no se indica explícitamente en la ficha del modelo cuantizado.
- Inferencia eficiente: gracias a la cuantización W4A16, el modelo reduce el uso de VRAM y acelera la inferencia en comparación con el modelo FP16 original.
- No se documentan capacidades específicas como tool calling, razonamiento multi-paso o visión en la información proporcionada.

## Casos de uso

- **Despliegue en producción con vLLM**: el modelo está diseñado para ejecutarse con `vLLM` usando `--quantization modelopt_fp4`, lo que permite servir el modelo con alta eficiencia en entornos de producción.
- **Chatbots en árabe e inglés**: al ser una cuantización del modelo ALLaM, es adecuado para asistentes conversacionales en estos idiomas, aunque no se confirman en esta ficha.
- **Aplicaciones con recursos limitados**: el tamaño del repositorio (4.7 GB) sugiere que puede ejecutarse en GPUs con menor VRAM, como RTX 3090 o RTX 4090, para tareas de generación de texto.
- **Investigación en cuantización**: sirve como punto de control para comparar el efecto de la calibración AWQ en modelos de la misma familia, dado que sus escalas de peso se calculan sin datos.
- **Integración en pipelines de inferencia**: puede usarse en sistemas que requieren baja latencia, como asistentes en tiempo real, aprovechando la cuantización W4A16.
- **Experimentación con ModelOpt**: es un ejemplo práctico de cuantización NVFP4 con activaciones FP16, útil para desarrolladores que exploran técnicas de compresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha no incluye métricas como MMLU, HumanEval o GSM8K. Solo se proporciona el error cuadrático medio de los pesos (1.038612e-06), que es un indicador de la fidelidad de la cuantización, pero no es comparable a benchmarks de calidad.

## Requisitos de hardware

- El tamaño del repositorio es de 4.7 GB, lo que indica que el modelo cuantizado ocupa menos de 5 GB en disco.
- No se especifican requisitos de VRAM exactos, pero al ser un modelo de ~3.7B parámetros con cuantización de 4 bits, se estima que puede caber en GPUs con 6-8 GB de VRAM, como una RTX 3060 o RTX 4060, aunque no está confirmado.
- Se requiere una GPU compatible con `vLLM` y el soporte de `modelopt_fp4` (NVIDIA). No se menciona soporte para CPU.
- La latencia y el throughput no están documentados; dependerán del hardware y de la configuración de `vLLM`.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. El modelo base ALLaM-7B-Instruct-preview tiene variantes FP8 y W4A4 (según se menciona en repositorios relacionados), pero no se tienen datos de rendimiento o especificaciones comparables. Por lo tanto, no se incluye una tabla comparativa.

## Limitaciones y advertencias

- **Precisión**: la cuantización de 4 bits puede degradar ligeramente la calidad del modelo en comparación con la versión FP16 original.
- **Compatibilidad**: no es cargable con `transformers`; requiere `vLLM` con soporte `modelopt_fp4`. Esto limita su uso en otras herramientas.
- **Licencia**: no se indica la licencia del modelo, por lo que no se puede garantizar el uso comercial sin verificar los términos del modelo base y del autor.
- **Datos de calibración**: el modelo fue calibrado con un dataset mixto, pero al no cuantizar las activaciones, la calibración no afecta a las escalas de peso, lo que puede ser un factor a considerar en la evaluación de rendimiento.
- **Idiomas**: aunque el modelo base está diseñado para árabe e inglés, no se confirma en esta ficha qué idiomas soporta la versión cuantizada.
- **Sesgos y alucinaciones**: no se documentan sesgos específicos, pero como cualquier LLM, puede presentar alucinaciones y sesgos derivados del entrenamiento original de ALLaM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NouraAlqasim/allam-7b-nvfp4-w4a16-mixed
- Paper de ALLaM (arXiv): https://arxiv.org/html/2407.15390v1
- Análisis de ALLaM en arabicagenticai.com: https://arabicagenticai.com/arabic-llms/allam/
- Perfil de GitHub de Noura Alqasim: https://github.com/NouraAlqasim
