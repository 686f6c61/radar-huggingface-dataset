# elyanlabs/elya-nes

## Resumen

elya-nes es un instrumento de medida ciclo-exacto para el CPU 2A03 de la NES/Famicom sobre el que se ha construido un forward pass de un transformer ternario con mezcla de expertos (8 expertos). El proyecto lo publica elyanlabs (Scottcjn en GitHub y GitLab) como parte de la serie "Transformers on Retro Game Consoles" en Hackaday.io, junto a ports hermanos para NES, SNES, Genesis, N64 y Game Boy Color. No es un modelo de propósito general: es una demostración reproducible de que un transformer cuantizado puede ejecutarse en hardware de 8 bits de 1,79 MHz y verificarse bit-exacto contra una referencia en host.

La implementación usa 446.464 pesos ternarios almacenados en el cartucho, de los que 102.400 se transmiten por token, activaciones de 4 bits y un vocabulario de 64 símbolos. Está entrenado sobre TinyStories con quantisation-aware training, de modo que el forward pass que ve el entrenador coincide con el que ejecuta el 6502. La verificación ROM vs host cubre 1.216 de 1.216 casos en una encuesta de 64 semillas (2.432 de 2.432 con las dos semillas). El contexto máximo es de 85 tokens (~124 caracteres), limitado por los 32 KB de PRG-RAM del cartucho.

El interés actual del proyecto es doble. Por un lado, documenta dos mejoras independientes que componen de forma casi aditiva: un normalizador de softmax exacto que recupera parte del presupuesto perdido por el desplazamiento potencia-de-dos del softmax entero (-0,0292 nats/carácter a capacidad densa, -0,0296 a 8 expertos), y una mezcla de expertos que aporta -0,1847 a -0,1851 nats/carácter. Por otro, corrige públicamente una cifra previa (-0,0375 atribuido a un baseline más antiguo) y publica el análisis completo en `FINDINGS.md`. Todo el repositorio es código: nada se ejecuta en la infraestructura de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ternario con mezcla de expertos (8 expertos), forward pass implementado en ensamblador 6502 para el 2A03 de la NES |
| Parametros totales | 446.464 pesos ternarios almacenados en el cartucho |
| Parametros activos | 102.400 pesos ternarios transmitidos por token |
| Longitud de contexto | 85 tokens (~124 caracteres), limitado por los 32 KB de PRG-RAM |
| Tipos de cuantizacion | Pesos ternarios (3 niveles), activaciones de 4 bits, cuantizacion con Aware Training (QAT) |
| Idiomas soportados | no disponible (vocabulario char-level de 64 simbolos, corpus de entrenamiento TinyStories en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible en safetensors/GGUF; el repositorio contiene codigo fuente y una imagen de cartucho NES de 548.880 B en 66 bancos |
| Vocabulario | 64 simbolos (char-level) |
| Tamano de imagen | 548.880 B, 66 bancos (frente a 106.512 B y 12 bancos del modelo denso) |
| Ciclos por token | 1.134.432 de media en el cartucho fusionado |
| Tiempo por token | 0,6338 s a 1,79 MHz en el 2A03 |

## Arquitectura y entrenamiento

La arquitectura es un transformer ternario con MoE de 8 expertos, activaciones de 4 bits y normalizador de softmax exacto, implementado a nivel de ciclo sobre el 2A03. Cada token activa únicamente 102.400 de los 446.464 pesos ternarios del cartucho. El vocabulario es char-level de 64 símbolos, adecuado para TinyStories. La verificación de corrección es bit-exacta contra una referencia en host: 1.216 de 1.216 aciertos en una encuesta de 64 semillas, y 2.432 de 2.432 con las dos semillas entrenadas.

El entrenamiento emplea TinyStories con quantisation-aware training, de modo que el forward pass del entrenador coincide con el del 6502. Los experimentos del repositorio usan 60.000 pasos y dos semillas por configuración. El softmax cuantizado original normalizaba con un desplazamiento potencia-de-dos (`kk` es el menor desplazamiento con `S >> kk <= 8`), por lo que la suma realizada caía en `(4, 8]` y una cuarta parte del tiempo el softmax operaba con la mitad del presupuesto. El normalizador exacto (`p = min(e*8/S, 7)`) recupera ese presupuesto con el mismo nibble de 3 bits y un reescalado de `AV_SHIFT` de 2 a 3, lo que mueve el resultado global de 1,4141 a 1,3766 nats/carácter (-0,0375, un 2,65 %) a igualdad de pasos y con dos semillas.

Los dos efectos componen: la predicción aditiva (1,4058 − 0,0292 − 0,1847 = 1,1920) coincide con la medición del cartucho fusionado (1,1915), con una interacción de −0,0005, dentro de la dispersión entre semillas (0,0076). Los ciclos también se suman: 1.117.248 → 1.129.375 (A) → 1.134.432 (ambos), frente a una predicción aditiva de 1.135.265. Ampliar el nibble de probabilidad a 8, 16 o 32 bits no aporta nada (1,5279 / 1,5335 / 1,5267 nats/carácter a igualdad de pasos): la fuga estaba en el exponente compartido, no en el ancho de bits. Tampoco ampliar el contexto a `T = 85` mejora la perplejidad: la penalización `T=85` menos `T=20` es de +0,0472 con el normalizador antiguo y +0,0487 con el nuevo, un cambio de 0,0015 dentro de la dispersión; el techo sigue siendo la capacidad.

## Capacidades

- Generación de texto char-level en inglés a partir de un token semilla, con salidas del estilo de TinyStories (por ejemplo, `'b'` → `'because he was so happy and sa'`, `'l'` → `'lily was very happy and saw a b'`).
- Inferencia completa sobre hardware NES/Famicom 2A03 real o emulado, con verificación bit-exacta contra la referencia en host.
- Mezcla de expertos con 8 expertos y 102.400 pesos activos por token dentro de un presupuesto fijo de 32 KB de PRG-RAM.
- Normalización softmax exacta con nibble de 3 bits, implementada en ensamblador 6502.
- Instrumentación ciclo-exacta: cada número publicado en `FINDINGS.md` está medido, no estimado.
- No soporta tool calling, function calling, agentes, multi-step reasoning, visión, audio, ni modo thinking.
- Capacidades multilingües: no disponibles; el vocabulario es char-level de 64 símbolos y el corpus es TinyStories en inglés.

## Casos de uso

- Investigación en cuantización ternaria extrema: el repositorio sirve como banco de pruebas reproducible para medir el coste real de ternarizar pesos y de añadir un normalizador softmax exacto, con cifras de nats/carácter y de ciclos por token.
- Estudio de MoE con presupuesto de memoria fijo: los 32 KB de PRG-RAM imponen un límite duro al número de expertos y al contexto, lo que convierte al cartucho en un experimento controlado sobre enrutamiento y capacidad efectiva.
- Docencia y divulgación: demuestra sobre hardware de 1,79 MHz conceptos como atención, softmax entero y quantisation-aware training, con la garantía de que la ROM y el host coinciden bit a bit.
- Medición de kernels en 6502: cualquier cambio en el forward pass puede medirse en ciclos/token (1.134.432 de media), lo que permite comparar implementaciones de bajo nivel con precisión de ciclo.
- Reproducibilidad de experimentos de ML: la verificación ROM vs host a 64 semillas (1.216/1.216 y 2.432/2.432) permite auditar que un cambio en el trainer se traduce exactamente en el mismo cambio en la ROM.
- Arte generativo y demoscene en NES: generar fragmentos cortos de texto en tiempo real sobre una consola de 8 bits, útil para instalaciones, prototipos homebrew y cartuchos demostrativos.
- Validación de ports hermanos: el mismo método de verificación ciclo-exacta se aplica a los ports NES, SNES, Genesis, N64 y Game Boy Color del proyecto, por lo que el repositorio actúa como referencia para esos puertos.

## Benchmarks y rendimiento

Resultados propios del repositorio (val nats/carácter, 60.000 pasos, dos semillas por celda):

| Configuracion | Semilla 1 / semilla 2 | Media |
|---|---:|---:|
| Denso + normalizador potencia-de-dos | 1,4020 / 1,4096 | 1,4058 |
| Denso + normalizador exacto | 1,3754 / 1,3779 | 1,3766 |
| 8 expertos + potencia-de-dos | 1,2202 / 1,2221 | 1,2211 |
| 8 expertos + normalizador exacto (cartucho fusionado) | 1,1932 / 1,1898 | **1,1915** |

Comparación interna del efecto del normalizador exacto (baseline antiguo frente a control denso entrenado en el árbol fusionado):

| Configuracion | Val nats/carácter | Delta |
|---|---:|---:|
| Softmax enviado (baseline antiguo) | 1,4141 | — |
| Softmax exacto | 1,3902 | −0,0239 |
| Softmax exacto + `AV_SHIFT 3` | 1,3766 | −0,0375 (2,65 %) |
| Control denso + potencia-de-dos en el árbol fusionado | 1,4058 | −0,0292 |
| 8 expertos + normalizador exacto en el árbol fusionado | 1,1915 | −0,0296 respecto al control denso |

Otras métricas publicadas:

| Metrica | Denso + pow2 | Cartucho fusionado |
|---|---:|---:|
| Pesos ternarios en el cartucho | 102.400 | 446.464 |
| Pesos ternarios transmitidos por token | 102.400 | 102.400 |
| Ciclos medios por token | 1.117.248 | 1.134.432 (+1,54 %) |
| Segundos por token | 0,6243 | 0,6338 |
| Imagen | 106.512 B, 12 bancos | 548.880 B, 66 bancos |
| ROM vs host (encuesta de 64 semillas) | 1.216/1.216 | 1.216/1.216 (2.432/2.432 con dos semillas) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; el modelo no está planteado para esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; la inferencia corre en el 2A03 de la NES y usa 32 KB de PRG-RAM como ventana de contexto.
- GPU recomendadas: no requiere GPU para inferencia. El entrenamiento y la verificación bit-exacta se ejecutan en un host cuya GPU no está especificada en la información disponible.
- Cabe en hardware consumer: cualquier NES/Famicom real o emulador compatible; la imagen de cartucho ocupa 548.880 B en 66 bancos.
- Opciones de despliegue: cartucho NES físico, emuladores de NES/Famicom (Mesen, FCEUX u otros compatibles) y el propio árbol de código del repositorio. No hay soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 0,6338 s por token a 1,79 MHz (1.134.432 ciclos medios por token).
- Throughput: aproximadamente 1,58 tokens/s, derivado de 0,6338 s/token; el contexto completo de 85 tokens requiere del orden de 54 s por generación, valor derivado de las cifras publicadas.
- Memoria: 32 KB de PRG-RAM y 548.880 B de imagen de cartucho; sin requisitos de memoria DRAM externa.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos directamente comparables: el proyecto es un instrumento de medida para 2A03 y no un modelo de NLP de propósito general. Las alternativas de la misma categoría (transformers en consolas retro) son los ports hermanos del propio proyecto en Hackaday.io (SNES, Genesis, N64, Game Boy Color), pero sus especificaciones no se detallan en la información disponible.

## Limitaciones y advertencias

- Contexto muy corto: 85 tokens (~124 caracteres). No puede mantener coherencia multi-turno ni razonamiento de varios pasos.
- Calidad de texto limitada: las salidas son fragmentos del estilo de TinyStories, no oraciones completas ni contenido factual verificado.
- Dominio de entrenamiento muy restringido (TinyStories en inglés) y vocabulario char-level de 64 símbolos; no es multilingüe.
- No soporta tool calling, function calling, agentes ni modo thinking; cualquier expectativa en ese sentido es incorrecta.
- Riesgo de alucinación: el modelo produce continuaciones plausibles estadísticamente pero sin conocimiento del mundo; no debe usarse como fuente de información.
- Licencia Apache 2.0: permite uso comercial del código, pero el modelo no es adecuado para tareas de NLP en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; proyecto de nicho, muy reciente y mantenido por un único autor, lo que implica un riesgo de mantenimiento.
- Es código fuente, no pesos en formato estándar (safetensors/GGUF); no se integra en pipelines habituales de inferencia.
- La corrección pública de la cifra de −0,0375 a −0,0292 (frente a un control denso del árbol fusionado) obliga a leer `FINDINGS.md` con atención antes de citar los resultados.
- El límite práctico sigue siendo la capacidad, no el contexto ni el normalizador: ampliar `T` de 20 a 85 no mejora la perplejidad (+0,0472 / +0,0487 nats/carácter).

## Enlaces

- Hugging Face: https://huggingface.co/elyanlabs/elya-nes
- Repositorio en GitHub: https://github.com/Scottcjn/elya-nes
- Repositorio en GitLab (historial completo): https://gitlab.com/elyan-labs/elya-nes
- Proyecto en Hackaday.io "Transformers on Retro Game Consoles": https://hackaday.io/project/206401-transformers-on-retro-game-consoles
