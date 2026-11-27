# dendriteholdings/Ingot-VI-9B-Q2

## Resumen

Ingot-VI-9B-Q2 es un modelo de lenguaje de 8.953.803.264 parámetros (≈9B) publicado por dendriteholdings como espejo público de una submission ganadora en Ingot, una subred de Bittensor en la que los mineros cuantizan un modelo profesor fijo y el validador premia la copia que se mantiene más próxima a él. El modelo parte de prism-ml/Ternary-Bonsai-2-9B-gguf y aplica un fine-tuning sobre los pesos no ternarios para acercar la distribución de salida a la del profesor Qwen3.5-9B.

La característica definitoria es su representación ternaria extrema: los pesos se almacenan a 1,75 bits por peso (2,00 GB) o a 2,125 bits por peso en un contenedor de 2 bits (2,42 GB), manteniendo los mismos códigos ternarios en ambos ficheros. Esto lo sitúa en la categoría de modelos de muy baja precisión orientados a inferencia con huella de memoria mínima, no a máximas cotas de rendimiento absoluto.

Es relevante ahora porque documenta un flujo de cuantización competitiva verificable (KL respecto al profesor como métrica) y porque requiere un fork específico de llama.cpp, lo que lo convierte en un caso de estudio sobre portabilidad de formatos GGUF no estándar y sobre los límites prácticos de la cuantización ternaria en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Ternary Bonsai 2 9B; detalles de capas y atención no disponibles) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria: PTQ1_0 a 1,75 bits por peso (2,00 GB) y PQ2_0 a 2,125 bits por peso en contenedor de 2 bits (2,42 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (Ingot-VI-9B-PTQ1_0.gguf, Ingot-VI-9B-PQ2_0.gguf); también disponible como pack MLX de 2 bits en dendriteholdings/Ingot-VI-9B-MLX-2bit |

## Arquitectura y entrenamiento

El modelo es un transformer de aproximadamente 9B parámetros cuyo sustrato es Ternary Bonsai 2 9B de Prism ML. La innovación central es la representación ternaria de pesos: cada bloque de 128 pesos conserva sus códigos ternarios y una escala fp16, de modo que cada peso decodifica a un valor discreto. El fichero PTQ1_0 es un reempaquetado sin pérdida del fichero del minero al formato de Prism, y el autor afirma que el mismo reempaquetado del fichero PQ2_0 de Bonsai 2 reproduce byte a byte el PTQ1_0 publicado por Prism, lo que sirve como verificación de la transformación.

El entrenamiento consiste en un fine-tuning del minero sobre los pesos no ternarios (los códigos ternarios se mantienen) para acercar la salida al profesor Qwen3.5-9B. La métrica de selección es la divergencia KL por token de respuesta entre las distribuciones del profesor en BF16 y las del modelo, ponderada por dominio: el modelo ganador obtiene KL 0,07284 frente a 0,07624 del rey al que destronó en la misma evaluación. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El modelo emplea una rotación de Hadamard y un tokenizador con el layout de dendriteholdings/Ingot-genesis-9B-Q2.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento y respuesta a instrucciones heredados del profesor Qwen3.5-9B, con fidelidad medida por KL respecto a él.
- Entrada de imágenes opcional: requiere añadir como proyector el vision tower de prism-ml/Ternary-Bonsai-2-9B-gguf (Ternary-Bonsai-2-9B-mmproj-Q8_0.gguf o BF16); la calidad de imagen no está probada para estos pesos.
- Compatibilidad declarada con endpoints (tag endpoints_compatible).
- Soporte de plantillas de chat vía `--jinja` en llama-server.
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en hardware con VRAM muy limitada: con 2,00-2,42 GB de pesos, el modelo cabe íntegramente en GPUs de consumo de gama baja y en sistemas embebidos, lo que permite servir generación de texto donde un modelo de 9B en fp16 sería inviable.
- Evaluación de cuantización ternaria en investigación: sirve para reproducir el protocolo de Ingot (KL frente a profesor por token de respuesta) y comparar la fidelidad de distintos esquemas de cuantización sobre el mismo sustrato.
- Prototipado rápido de asistentes conversacionales: la plantilla de chat con `--jinja` y el tamaño reducido permiten levantar un servidor llama.cpp en minutos para pruebas de interacción multi-turno.
- Inferencia en Apple Silicon: el pack MLX de 2 bits (dendriteholdings/Ingot-VI-9B-MLX-2bit) habilita ejecución nativa en Mac con memoria unificada, útil para desarrollo local sin GPU dedicada.
- Experimentos de destilación y alineamiento: al estar entrenado para minimizar KL respecto a Qwen3.5-9B, es un banco de pruebas para estudiar hasta qué punto un modelo ternario puede imitar a un profesor de mayor precisión.
- Docencia y divulgación sobre Bittensor: el modelo ilustra de forma concreta cómo funciona una subred de cuantización competitiva, con hotkey, uid y submission identificables.
- Procesamiento de imágenes de baja exigencia: añadiendo el mmproj de Bonsai 2 se puede explorar entrada multimodal, asumiendo que la calidad no está validada.

## Benchmarks y rendimiento

| Metrica | Este modelo | Rey al que destronó |
|---|---|---|
| KL(profesor ‖ modelo) por token de respuesta, ponderada por dominio | 0,07284 | 0,07624 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La única métrica reportada es la divergencia KL frente al profesor Qwen3.5-9B en la evaluación de Ingot.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,00 GB para PTQ1_0 y 2,42 GB para PQ2_0 solo en pesos; añadir overhead de contexto KV y del runtime (no cuantificado en la información disponible).
- GPU recomendadas: cualquier GPU con al menos 3-4 GB de VRAM efectiva; el autor indica que el fichero de 2 bits decodifica más rápido en GPU que el de 1,75 bits.
- Cabe en GPU de consumo: sí, en tarjetas de gama baja y media (por ejemplo, series RTX xx50/xx60 y superiores); también en Apple Silicon vía el pack MLX.
- Opciones de despliegue: llama.cpp en el fork de DendriteLabs de PrismML en el commit `9991ae5`; llama-server con `-ngl 99 -fa on --jinja`. Stock llama.cpp no ejecuta estos ficheros. Para Apple Silicon, MLX con el pack de 2 bits.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ingot-VI-9B-Q2 | 8,95B | no disponible | Ternaria 1,75-2,125 bpw | no disponible | GGUF (fork de llama.cpp) y MLX |
| prism-ml/Ternary-Bonsai-2-9B-gguf | ≈9B | no disponible | Ternaria (PTQ1_0, PQ2_0) | no disponible | GGUF (modelo base) |
| dendriteholdings/Ingot-genesis-9B-Q2 | ≈9B | no disponible | Ternaria Q2 | no disponible | GGUF (mismo layout y tokenizador) |
| Qwen3.5-9B (profesor) | ≈9B | no disponible | BF16 y otras | no disponible | Pesos completos |

La comparación con modelos de 9B en precisión estándar (por ejemplo, familias Llama o Qwen en 8-9B) no está soportada por datos de benchmarks en la información disponible; la única ventaja cuantificable es la huella de memoria, unas 8-9 veces menor que un modelo equivalente en fp16.

## Limitaciones y advertencias

- Requiere un fork específico de llama.cpp (DendriteLabs, commit `9991ae5`); stock llama.cpp no carga los ficheros, lo que complica el despliegue y la actualización de dependencias.
- La licencia no está declarada, por lo que el uso comercial es incierto y debe verificarse con el autor y con la licencia del modelo base antes de producción.
- La calidad se mide únicamente como proximidad al profesor (KL 0,07284); no hay evidencia de rendimiento en tareas downstream estándar.
- La cuantización ternaria a 1,75-2,125 bits por peso implica una pérdida de capacidad frente al profesor BF16 que la métrica KL no cuantifica en términos de utilidad práctica.
- La entrada de imágenes usa un proyector diseñado para genesis, no para estos pesos, y no ha sido evaluada: la calidad multimodal es desconocida.
- Idiomas soportados no declarados; el comportamiento fuera del inglés (o del idioma dominante del profesor) es incierto.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero esperables en un modelo destilado de baja precisión.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin comunidad que valide su comportamiento en producción.
- Procede de una submission de minería (hotkey `5F9YB43h4GCvdPYpmC2oEN8yerL63nu5jXqZZKKudabpkrrc`, uid 232) y su evaluación se limita al protocolo de la subred.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-VI-9B-Q2
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Proyector de visión Q8_0: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf/blob/82265ccc78ddaac4700286a35e9badcc32376dd9/Ternary-Bonsai-2-9B-mmproj-Q8_0.gguf
- Proyector de visión BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf/blob/82265ccc78ddaac4700286a35e9badcc32376dd9/Ternary-Bonsai-2-9B-mmproj-BF16.gguf
- Pack MLX de 2 bits: https://huggingface.co/dendriteholdings/Ingot-VI-9B-MLX-2bit
- Modelo con layout de referencia: https://huggingface.co/dendriteholdings/Ingot-genesis-9B-Q2
- Fork de llama.cpp: https://github.com/DendriteLabs/llama.cpp
- Commit de evaluación: https://github.com/DendriteLabs/llama.cpp/commit/9991ae551cc08c354971ebbe739931c1f9dcfcc8
