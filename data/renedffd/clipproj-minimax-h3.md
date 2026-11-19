# Renedffd/ClipProj-MiniMax-H3

## Resumen

ClipProj-MiniMax-H3 es un conjunto de matrices de proyección que permiten sustituir el codificador de texto Qwen3-VL-32B de MiniMax H3 por un Qwen3-VL-4B o 8B, reduciendo el consumo de VRAM de 15,7 GB a 4,5 GB sin modificar el modelo de difusión, los VAE ni el sampler. Lo publica el usuario Renedffd (con documentación original atribuida a NicoLab28) como prueba de concepto funcional, no como herramienta de producción. El repositorio ocupa 4,9 GB y se distribuye bajo licencia MIT.

El problema que resuelve es práctico: MiniMax H3, un modelo de generación de vídeo texto-a-vídeo, depende de un codificador de texto de 32B parámetros que domina el presupuesto de memoria en inferencia local. ClipProj ajusta una transformación lineal (y una variante con red residual, sufijo `-mlp`) entre el espacio latente de un Qwen3-VL pequeño y el del 32B, calibrada en un corpus multilingüe, de modo que el pipeline de difusión recibe condicionamiento compatible.

La relevancia actual es doble: por un lado, demuestra que es viable alinear dos codificadores de texto nunca entrenados conjuntamente mediante una proyección ajustada sin gradientes; por otro, la versión v3.1 mejora la pronunciación en diez idiomas no ingleses (29 % menos errores de fonema globales, 60-74 % en español, francés, alemán e italiano). Los ficheros no son autónomos: requieren el nodo personalizado ComfyUI-ClipProj.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matrices de proyección lineal (y variante con red residual `-mlp`) sobre codificador de texto Qwen3-VL; pipeline de difusión MiniMax H3 sin modificar |
| Parametros totales | No disponible (las matrices de proyección ocupan 26 MB en la variante 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (matrices en fp16; la variante `-mlp` se publica en fp16) |
| Idiomas soportados | Once idiomas en la prueba de pronunciación (inglés y diez adicionales, entre ellos español, francés, alemán e italiano) |
| Licencia | MIT |
| Formato de pesos | No disponible (ficheros de proyección para ComfyUI; tamaño del repo 4,9 GB) |

## Arquitectura y entrenamiento

El componente central es una proyección que mapea el espacio de representaciones de un Qwen3-VL-4B o 8B al espacio esperado por MiniMax H3, cuyo codificador nativo es un Qwen3-VL-32B. La variante `-mlp` añade una red residual a la proyección lineal. El ajuste se realiza en una sola pasada, sin gradientes ni tasa de aprendizaje, sobre un corpus de calibración. La versión v3.1 modifica ese corpus para dar a cada sistema de escritura una cuota comparable en lugar de estar dominado por el inglés, e incorpora texto árabe sin procesar.

El modelo de difusión, los VAE y el sampler de MiniMax H3 permanecen intactos; solo cambia el codificador de texto y la proyección intermedia. La documentación del autor reconoce que el ajuste se hizo con exploración deliberadamente limitada y en un único entorno (Windows 11, NVIDIA, ComfyUI 0.31.0). No se especifican el número de tokens de entrenamiento ni la composición exacta del dataset más allá de la mención al reequilibrio multilingüe.

## Capacidades

- Condicionamiento texto-a-vídeo para MiniMax H3 usando un codificador Qwen3-VL-4B u 8B en lugar del 32B.
- Generación de vídeo con audio y habla en once idiomas, con mejora específica de pronunciación en español, francés, alemán e italiano en v3.1.
- Variantes `-mlp` con red residual para mayor fidelidad de la proyección.
- Compatibilidad con el nodo ComfyUI-ClipProj 0.1.13 (v3.1) y 0.1.4 o superior (conjunto `celeb-mlp`).
- Reducción de VRAM del codificador de 15,7 GB a 4,5 GB.
- No se documentan tool calling, function calling, capacidades de agente ni modo thinking; el modelo es un componente de condicionamiento, no un LLM de propósito general.

## Casos de uso

- Generación de vídeo local en GPU de consumo: sustituir el codificador de 32B por el de 4B permite ejecutar el pipeline de MiniMax H3 en tarjetas con menos de 16 GB de VRAM, manteniendo el modelo de difusión original.
- Doblaje y locución multilingüe: la mejora de pronunciación en v3.1 hace viable generar habla en español, francés, alemán e italiano con menos errores de fonema (60-74 % menos) para prototipos de vídeo narrado.
- Prototipado rápido en ComfyUI: con 26 MB de proyección y 4,6 GB junto a su codificador, se pueden encadenar iteraciones de texto-a-vídeo sin recargar el modelo grande.
- Investigación sobre alineación de espacios latentes: sirve como caso de estudio reproducible de mapeo lineal entre codificadores de texto no entrenados conjuntamente, con datos de calibración y mediciones publicadas.
- Evaluación comparativa de codificadores: permite medir el impacto de usar un 4B frente a un 8B o al 32B en la calidad de imagen y habla, con la metodología de tres semillas y 297 renders de audio documentada.
- Docencia y divulgación: el repositorio incluye MEASUREMENTS.md y CALIBRATION.md con intentos fallidos, útil para explicar metodología experimental en difusión.
- Entornos con memoria ajustada: el nodo 0.1.4 libera la tarjeta antes de cargar un codificador de reemplazo, lo que permite operar cuando dos codificadores no caben simultáneamente.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Errores de fonema globales (v3.1 vs v3) | 29 % menos |
| Errores de fonema en español, francés, alemán e italiano | 60-74 % menos |
| Varianza del 32B al cambiar solo la semilla | 5,8 fonemas de 75 re-pronunciados distinto |
| Fonemas distintos en los cuatro ficheros v3.1 | 6,4 a 7,0 de 75 |
| Ganancia en imagen de v3.1 sobre v3 | No medible (puntuaciones solapadas) |
| VRAM del codificador | 15,7 GB (32B) frente a 4,5 GB (4B/8B) |
| VRAM de la red residual `-mlp` en fp16 | 240 MB (4B), 288 MB (8B) |
| Renders de audio en la evaluación | 297 (tres semillas) |
| Renders de imagen en la evaluación | 405 |
| Configuración de la prueba de vídeo | 0,3 MP, 6 pasos de muestreo, 88 segundos, once idiomas |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 4,5 GB para el codificador 4B con su proyección; 15,7 GB con el 32B original. La red residual `-mlp` añade 240 MB (4B) o 288 MB (8B) en fp16.
- GPU recomendadas: no se especifican modelos concretos; el autor probó en NVIDIA bajo Windows 11 con ComfyUI 0.31.0.
- Cabe en GPU de consumo: sí, con el codificador 4B (4,5 GB más el modelo de difusión y los VAE de MiniMax H3, cuyo consumo no se detalla).
- Despliegue: exclusivamente mediante el nodo personalizado ComfyUI-ClipProj (versión 0.1.13 para v3.1, 0.1.4 o superior para `celeb-mlp`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La evaluación usó 0,3 MP y 6 pasos de muestreo para hacer asequibles 297 renders.

## Comparativa con modelos similares

| Modelo | Parametros del codificador | VRAM del codificador | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClipProj-MiniMax-H3 (4B) | 4B (Qwen3-VL) | 4,5 GB | No disponible | MIT | Hugging Face, requiere nodo ComfyUI |
| ClipProj-MiniMax-H3 (8B) | 8B (Qwen3-VL) | No disponible | No disponible | MIT | Hugging Face, requiere nodo ComfyUI |
| MiniMax H3 original | 32B (Qwen3-VL) | 15,7 GB | No disponible | No disponible | Comfy-Org/MiniMax-H3 |

No se dispone de información sobre otros proyectos de proyección de codificadores para MiniMax H3 con los que comparar.

## Limitaciones y advertencias

- Prueba de concepto: el propio autor la etiqueta como tal, construida y probada en un único entorno (Windows 11, NVIDIA, ComfyUI 0.31.0) con exploración limitada.
- Los ficheros no funcionan de forma autónoma: requieren el nodo ComfyUI-ClipProj y una versión mínima concreta (0.1.13 o 0.1.4 según el conjunto).
- La evaluación de imagen no distingue v3.1 de v3 ni a ninguno de ellos del 32B; la similitud coseno es ciega a atributos contables, por lo que no puede afirmarse equivalencia total con el codificador original.
- La varianza del propio 32B al cambiar la semilla (5,8 fonemas de 75) es del mismo orden que la diferencia entre variantes, lo que limita las conclusiones sobre calidad absoluta.
- El vídeo de demostración se generó a 0,3 MP y 6 pasos, con audio de baja calidad (caída de 19 dB entre 1 y 3 kHz) idéntica en el 32B; no es representativo de la calidad final.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; el corpus de calibración se reequilibró por sistema de escritura, lo que sugiere un sesgo previo hacia el inglés.
- Licencia MIT permite uso comercial, pero la naturaleza de prueba de concepto y la dependencia de un nodo de terceros desaconsejan producción sin validación propia.
- Los ficheros `-mlp` se reemplazaron bajo los mismos nombres; descargas antiguas con nodos previos a 0.1.4 se cargan en fp32 y pierden el ahorro de memoria.

## Enlaces

- Hugging Face: https://huggingface.co/Renedffd/ClipProj-MiniMax-H3
- Repositorio del nodo: https://github.com/nicolab28/ComfyUI-ClipProj
- Mediciones: https://github.com/nicolab28/ComfyUI-ClipProj/blob/main/MEASUREMENTS.md
- Calibración: https://github.com/nicolab28/ComfyUI-ClipProj/blob/main/CALIBRATION.md
- Informe de benchmarks v3.1: https://huggingface.co/NicoLab28/ClipProj-MiniMax-H3/blob/main/bench3.1/README.md
- Vídeo de demostración multilingüe: https://huggingface.co/NicoLab28/ClipProj-MiniMax-H3/resolve/main/bench3.1/video/clipproj-v3.1-eleven-languages.mp4
- Modelo base: https://huggingface.co/Comfy-Org/MiniMax-H3
- Codificador de texto: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
