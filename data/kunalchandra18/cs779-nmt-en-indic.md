# kunalchandra18/cs779-nmt-en-indic

## Resumen

El modelo `cs779-nmt-en-indic` es un sistema de traducción automática neuronal (NMT) entrenado desde cero para traducir del inglés al bengalí y al hindi. Fue desarrollado por kunalchandra18 como parte de la competición CS779 de traducción automática en el IIT Kanpur. El modelo emplea una arquitectura Transformer con normalización pre-LN, 6 capas de codificador y 6 de decodificador, dimensión de modelo 512 y 8 cabezas de atención, con embeddings atados entre codificador y decodificador. Se distribuye bajo licencia MIT y el repositorio ocupa 0,3 GB, incluyendo dos checkpoints (uno por idioma) y sus vocabularios correspondientes. Su relevancia radica en ofrecer una solución ligera y entrenable en hardware modesto (una GPU P100 de Kaggle) para traducción inglés-bengalí e inglés-hindi, dos pares de lenguas con recursos limitados en el ecosistema open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Pre-LN (6+6 capas, d=512, 8 cabezas, embeddings atados) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (checkpoints guardados en precisión mixta) |
| Idiomas soportados | en, bn, hi |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pth) y vocabularios en .pkl |

## Arquitectura y entrenamiento

El modelo es un Transformer estándar con normalización pre-LN (Pre-LayerNorm), lo que estabiliza el entrenamiento en profundidad. Consta de 6 capas de codificador y 6 de decodificador, con dimensión de modelo 512 y 8 cabezas de atención. Los embeddings de entrada y salida están atados (tied embeddings), lo que reduce el número de parámetros. Se entrenó desde cero, sin pesos preentrenados, durante 15 épocas por idioma en una GPU P100 de Kaggle, con un tiempo total de 150 minutos. Se guardó el checkpoint con mejor BLEU en validación, no el de la última época. Los vocabularios se construyeron con `min_freq: 2`, lo que implica que las palabras poco frecuentes quedan fuera del vocabulario. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; el entrenamiento es supervisado estándar con pérdida de entropía cruzada.

## Capacidades

- Traducción automática de inglés a bengalí y de inglés a hindi.
- Generación de texto en los idiomas de destino a partir de frases en inglés.
- Soporte de vocabularios específicos por idioma (tamaños 31920/37921 para bengalí y 33366/31680 para hindi).
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multimodales (solo texto).
- Multilingüe limitado a los tres idiomas indicados (en, bn, hi).

## Casos de uso

- Traducción de contenido web: el modelo puede traducir artículos, blogs o páginas de documentación del inglés al bengalí o hindi, permitiendo localización rápida de sitios con poco tráfico.
- Atención al cliente bilingüe: integrado en un sistema de tickets, puede traducir consultas de clientes en inglés a hindi o bengalí para que agentes que hablen esos idiomas las respondan, y viceversa.
- Subtitulado de vídeos: dado un guion en inglés, el modelo genera subtítulos en bengalí o hindi, útil para creadores de contenido que quieran ampliar su audiencia en el sur de Asia.
- Traducción de documentos técnicos: manuales, guías o especificaciones pueden traducirse automáticamente, aunque se recomienda revisión humana por las limitaciones de vocabulario.
- Aplicaciones educativas: herramientas de aprendizaje de idiomas que necesiten traducir frases cotidianas del inglés al hindi o bengalí para ejercicios de práctica.
- Prototipado rápido de sistemas NMT: al ser un modelo pequeño y con licencia MIT, sirve como base para experimentos académicos o pruebas de concepto en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que se seleccionó el checkpoint con mejor BLEU durante el entrenamiento, pero no se proporcionan valores concretos.

## Requisitos de hardware

- El modelo es ligero (0,3 GB en disco), por lo que cabe en cualquier GPU consumer con al menos 2 GB de VRAM, como una GTX 1050 Ti o superior.
- Para inferencia en CPU, es viable en equipos con 8 GB de RAM, aunque la latencia será mayor.
- Se entrenó en una GPU P100 (16 GB), pero la inferencia no requiere ese nivel de hardware.
- Opciones de despliegue: PyTorch nativo, exportación a ONNX para servidores de inferencia, o integración en aplicaciones Python.
- No se dispone de datos de latencia o throughput específicos, pero al ser un modelo de tamaño reducido, se espera una velocidad de decodificación aceptable en hardware moderno.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (traducción inglés-bengalí/hindi) dentro de los datos proporcionados. Se recomienda consultar modelos como `facebook/nllb-200-3.3B` o `google/mt5` para comparaciones, pero no se incluyen aquí por falta de datos verificables.

## Limitaciones y advertencias

- El vocabulario se construyó con `min_freq: 2`, por lo que los nombres propios y términos poco frecuentes quedan fuera del vocabulario y se traducen como tokens desconocidos, produciendo ruido en la salida.
- El modelo solo cubre dos pares de idiomas (en-bn y en-hi); no soporta otros idiomas indios ni traducción inversa.
- No se especifica la longitud máxima de contexto; es probable que esté limitada a frases cortas o párrafos, no apto para documentos largos.
- Al ser un modelo entrenado desde cero con un corpus limitado (no se detalla su tamaño), puede presentar alucinaciones o traducciones incorrectas en dominios especializados.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre la calidad de las traducciones.
- Los checkpoints están en formato fp16; aunque el autor afirma que decodifican idénticamente a fp32, es recomendable verificar en casos de uso críticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kunalchandra18/cs779-nmt-en-indic
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/kunalchandra18/english-to-indic-translator
- Repositorio de código: https://github.com/kunalchandra18/Neural-English-to-Indic-Machine-Translator
