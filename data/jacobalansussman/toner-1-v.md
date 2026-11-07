# jacobalansussman/TONER-1-V

## Resumen

TONER-1-V es un modelo generativo de imagen de escala extrema desarrollado por el usuario independiente jacobalansussman. Se trata de un transformer de 103.536 parámetros que genera doodles de 16 × 16 píxeles en un solo bit, es decir, imágenes binarias en blanco y negro. El modelo se presenta como la vertiente visual de TONER-1, un fine-tune de `stories260K` (260.032 parámetros) orientado a generar historias cortas; juntos forman un pipeline que se ejecuta íntegramente dentro de un intérprete PostScript, sin intervención de la CPU del host.

La relevancia del modelo no reside en su calidad de generación, sino en su carácter de demostración técnica: ambos modelos corren dentro de un trabajo de impresión PostScript enviado a una impresora láser HP Color LaserJet Pro MFP M281fdw, que ejecuta la inferencia en su propia CPU. TONER-1-V recibe como entrada uno de 18 nombres de clase (extraído del texto generado por TONER-1) y produce 64 tokens, uno por cada parche de 2 × 2 píxeles, que se rasterizan en una imagen de 16 × 16.

El modelo se publica bajo licencia CC BY 4.0, con pesos en safetensors en float32 (los pesos previos a la cuantización int8 usada en el trabajo de impresión) y está pensado para cargarse con `model.py` de llama2.c. Es, en palabras del autor, una parodia deliberada de las fichas de modelos multimodales, pero con una implementación real y reproducible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama-2 (llama2.c) |
| Parámetros totales | 103.536 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (secuencia de 64 tokens de parche + tokens de clase) |
| Tipos de cuantización | int8 (en el trabajo PostScript); float32 en safetensors |
| Idiomas soportados | en (inglés) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

TONER-1-V emplea la arquitectura decoder de Llama-2 implementada en llama2.c, adaptada a un vocabulario específico que incluye tokens de clase (18 clases) y tokens de parche (16 valores posibles por parche de 2 × 2 píxeles). La generación procede autorregresivamente: se parte de un token BOS y un token de clase, y se generan 64 tokens de parche en orden de rasterizado 8 × 8, cada uno correspondiente a un bloque de 2 × 2 píxeles de la imagen final de 16 × 16.

El entrenamiento se realizó sobre 171.000 dibujos del dataset Quick, Draw! de Google (CC BY 4.0), rasterizados a 16 × 16 píxeles y un bit por píxel. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO. La innovación técnica principal no está en el modelo en sí, sino en su integración: los pesos se cuantizan a int8 y se embeben en un fichero PostScript (`TONER-1-V_print-job.ps`, 859.530 bytes) que contiene ambos modelos (363.568 parámetros en total) y se ejecuta en el intérprete PostScript de la impresora.

## Capacidades

- Generación de imágenes binarias de 16 × 16 píxeles en 18 clases predefinidas (incluyendo, entre otras, `house` y `frog`).
- Generación condicionada por clase: la entrada es un nombre de clase, no una descripción en lenguaje natural.
- Generación autorregresiva por parches de 2 × 2 píxeles (64 tokens por imagen).
- Control de temperatura de muestreo (valor por defecto 0,9; a 0 se obtiene siempre un doodle en blanco por argmax).
- Ejecución nativa en PostScript Level 2 o superior, sin dependencias de Python en tiempo de impresión.
- Carga de pesos en Python mediante `model.py` de llama2.c para inferencia fuera de la impresora.
- No soporta tool calling, function calling, agentes, visión, audio ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (etiquetas de clase en inglés).

## Casos de uso

- Demostración de inferencia en dispositivos extremos: el modelo sirve para ilustrar que un transformer puede ejecutarse en hardware tan limitado como la CPU de una impresora láser, con tiempos medidos de 24,77 s para 64 tokens de parche (2,58 tok/s).
- Prueba de concepto de pipeline multimodal integrado: combinado con TONER-1, permite generar una historia y su ilustración en un único trabajo de impresión, seleccionando automáticamente el sustantivo dibujable del texto.
- Educación en arquitecturas transformer: al ser un modelo de 103.536 parámetros con pesos en safetensors y código de carga basado en llama2.c, es adecuado para explicar el funcionamiento de un decoder autorregresivo con un coste computacional mínimo.
- Investigación en generación de imágenes de muy baja resolución: útil para estudiar la viabilidad de representaciones de un bit por píxel y parches de 2 × 2 en tareas de doodle.
- Arte generativo y proyectos de impresión creativa: la generación de doodles de 16 × 16 en un solo bit encaja en instalaciones de arte por ordenador, fanzines o experimentos de "printer art".
- Reproducibilidad y auditoría de trabajos PostScript: el fichero de impresión incluye los pesos int8 y la lógica de muestreo, lo que permite reproducir byte a byte la salida en distintos intérpretes (con la salvedad de la implementación de `rand`).
- Benchmarking de intérpretes PostScript: las diferencias de comportamiento entre Ghostscript y el intérprete de la impresora (misma salida salvo finales de línea) permiten comparar implementaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento medidos son los tiempos de ejecución en la impresora HP Color LaserJet Pro MFP M281fdw, según su propio reloj:

| Métrica | Valor |
|---|---|
| Tokens de parche generados | 64 (65 pasadas forward) |
| Tiempo de generación del doodle | 24,77 s |
| Throughput del doodle | 2,58377 tok/s |
| Tiempo de generación de la historia (TONER-1) | 217,806 s para 200 tokens (0,918248 tok/s) |
| Tiempo total del trabajo | 4:04 desde el envío hasta el trabajo terminado |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en float32 (103.536 parámetros × 4 bytes ≈ 414 KB), y aproximadamente 104 KB en int8. Cabe en cualquier GPU, CPU o microcontrolador con memoria suficiente.
- GPU recomendadas: no se requiere GPU; el modelo está diseñado para ejecutarse en CPU. Cualquier GPU moderna (RTX 4090, A100, H100) lo ejecutaría con latencias despreciables, pero no aporta ventaja práctica.
- Cabe en cualquier GPU de consumo e incluso en hardware embebido; el caso documentado es una impresora láser.
- Opciones de despliegue: intérprete PostScript Level 2 o superior (Ghostscript 10.07.1 validado para previsualización); Python con `model.py` de llama2.c y `safetensors`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en Ghostscript sobre un Apple M4 Mac, unos pocos segundos para una página ilustrada completa; en la impresora HP, 24,77 s para el doodle y 4:04 para el trabajo completo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TONER-1-V | 103.536 | no disponible | Imagen 16 × 16, 1 bit, 18 clases | CC BY 4.0 | Hugging Face |
| TONER-1 | 260.032 | no disponible | Texto (historias cortas) | no disponible en la información | Hugging Face |
| `stories260K` (base de TONER-1) | 260.032 | no disponible | Texto | no disponible en la información | llama2.c |
| Modelos text-to-image convencionales (p. ej. Stable Diffusion) | cientos de millones a miles de millones | no aplica | Imágenes de alta resolución | variables | Hugging Face |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento con alternativas. La comparación relevante es cualitativa: TONER-1-V opera en un régimen de escala (103.536 parámetros, 16 × 16 píxeles, 1 bit) que no tiene equivalentes directos en el ecosistema de modelos text-to-image convencionales.

## Limitaciones y advertencias

- Resolución extremadamente baja: 16 × 16 píxeles en un solo bit, con 18 clases cerradas; no es un modelo de propósito general.
- La entrada no es lenguaje natural libre, sino un nombre de clase seleccionado por el pipeline; no acepta prompts descriptivos.
- A temperatura 0 la generación por argmax produce siempre un doodle en blanco.
- El comportamiento de `rand` en PostScript es dependiente de la implementación: otro intérprete puede generar una historia y un doodle distintos con la misma semilla.
- La impresora debe soportar PostScript Level 2 o superior; impresoras solo PCL o GDI pueden imprimir el trabajo como páginas de texto.
- El trabajo de impresión tarda más de 4 minutos; impresoras con un timeout de trabajo PostScript inferior lo cancelarán.
- Solo se debe enviar a impresoras propias o con permiso explícito de uso.
- Riesgo de alucinación no aplica en el sentido habitual, pero el selector de sustantivo puede no encontrar nada dibujable y recurrir a una clase de reserva (documentado: `DSEED mod 18 = 6` → `frog`).
- Sesgos del dataset Quick, Draw! subyacentes: los doodles reflejan los sesgos de representación y estilo del dataset original.
- Licencia CC BY 4.0: permite uso comercial con atribución; no se documentan restricciones adicionales.
- El modelo es una parodia deliberada; no debe evaluarse con los criterios de calidad de un modelo text-to-image de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jacobalansussman/TONER-1-V
- Modelo TONER-1: https://huggingface.co/jacobalansussman/TONER-1
- Repositorio GitHub con logs de la ejecución en impresora: https://github.com/jacobalansussman/toner-1/tree/main/docs/printer-run-2026-11-05
- llama2.c (Karpathy), del que se usa `model.py`: https://github.com/karpathy/llama2.c/blob/master/model.py
- Dataset Quick, Draw! de Google (referencia del paper citado en los tags): arXiv:2305.07759
- Fichero de trabajo de impresión: `TONER-1-V_print-job.ps` (incluido en el repositorio del modelo)
- Hoja de muestras renderizada con Ghostscript: `samples/sample_sheet.pdf` y `samples/sample_sheet_ghostscript-render.png`
