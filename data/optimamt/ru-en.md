# OptimaMT/ru-en

## Resumen

OptimaMT/ru-en es una reexportación optimizada del modelo de traducción automática Xenova/opus-mt-ru-en, que a su vez deriva del clásico OPUS-MT de la Universidad de Helsinki. Se trata de un modelo Marian (transformer encoder-decoder) especializado en traducción unidireccional ruso-inglés, empaquetado en formato ONNX para su uso con Transformers.js y ONNX Runtime. La modificación introducida por OptimaMT consiste en reconstruir únicamente el decoder fusionado cuantizado, aplicando el modo rápido de ONNX Runtime (`disable_quant_qdq = 1`) para acelerar la inferencia entre 2,3 y 2,5 veces y reducir el consumo de memoria aproximadamente a la mitad.

El modelo mantiene exactamente los mismos pesos y produce las mismas secuencias que el original, por lo que es un reemplazo directo ("drop-in") sin pérdida de calidad. Está pensado para escenarios de traducción en el navegador o en aplicaciones de escritorio donde los recursos son limitados, como demuestra su uso en OpenCircle, un traductor de pantalla para Windows y Linux. Forma parte de una colección de 51 pares de idiomas publicados bajo el mismo esquema de nombres `OptimaMT/<src>-<tgt>`.

Su relevancia actual radica en la eficiencia: ofrece traducción ruso-inglés de calidad OPUS-MT con un consumo de memoria tras la carga de unos 282 MiB en Linux y 259 MiB en Windows, lo que lo hace viable en entornos con poca RAM y sin GPU dedicada. La licencia CC BY 4.0 permite uso comercial con atribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | ONNX cuantizado (q8); decoder fusionado cuantizado reconstruido |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (Transformers.js); vocabulario de 62.518 tokens |
| Tamaño del repositorio | 0,1 GB |
| Modelo base | Xenova/opus-mt-ru-en (revisión `afe8c6c738ec`) |
| Pipeline | translation |
| Librería | transformers.js |

## Arquitectura y entrenamiento

La arquitectura es Marian, la empleada por la familia OPUS-MT de Helsinki-NLP: un transformer encoder-decoder estándar orientado a traducción automática neuronal. El modelo original fue entrenado por la Universidad de Helsinki dentro del proyecto OPUS-MT; no se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron técnicas de alineación como RLHF o DPO.

La innovación de esta versión concreta no reside en el entrenamiento sino en el empaquetado: OptimaMT reconstruye solo el archivo `onnx/decoder_model_merged_quantized.onnx`, moviendo la proyección de salida del decoder fuera de sus dos ramas (un cambio exclusivamente de grafo). El resto de archivos son idénticos byte a byte al original. Con el modo rápido de ONNX Runtime (`disable_quant_qdq = 1`) se obtiene una aceleración de 2,3 a 2,5 veces y una reducción de memoria del 47-48 % en Linux y Windows, manteniendo tokens de salida idénticos. La decodificación empleada en la evaluación es greedy.

## Capacidades

- Traducción automática unidireccional de ruso a inglés.
- Generación de texto seq2seq mediante el pipeline `translation` de Transformers.js.
- Ejecución en CPU con ONNX Runtime, sin necesidad de GPU.
- Funcionamiento en navegador (Transformers.js) y en aplicaciones de escritorio (Python con onnxruntime, sentencepiece y numpy).
- Producción de salidas idénticas al modelo base Xenova/opus-mt-ru-en.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada estrictamente al par ruso-inglés.

## Casos de uso

- Traducción de pantalla en tiempo real: integrado en aplicaciones de escritorio como OpenCircle, traduce texto ruso visible en pantalla al inglés con bajo consumo de memoria (unos 260-280 MiB tras la carga), adecuado para equipos sin GPU.
- Traducción en el navegador sin servidor: mediante Transformers.js y el pipeline `translation`, permite traducir contenido ruso del lado del cliente, evitando enviar texto a un backend y reduciendo costes de infraestructura.
- Procesamiento por lotes de documentación rusa: para pipelines de localización que conviertan corpus rusos a inglés en CPU, aprovechando la aceleración de 2,3-2,5× del decoder reconstruido.
- Traducción en dispositivos de recursos limitados: su reducción de memoria del 47-48 % frente al original lo hace viable en máquinas con poca RAM o en contenedores con límites estrictos.
- Preprocesamiento para pipelines de NLP: traducir texto ruso a inglés antes de pasarlo a modelos de análisis, indexación o moderación que solo operen en inglés.
- Herramientas de accesibilidad y lectura: integrar traducción ruso-inglés en lectores, extensiones o utilidades de escritorio que necesiten funcionar offline.
- Sustitución directa en despliegues existentes: al ser un reemplazo drop-in de Xenova/opus-mt-ru-en con los mismos tokens, permite migrar sin cambiar código ni validar de nuevo las salidas.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| FLORES-200 devtest (1.012 frases), BLEU | 28,51 |
| FLORES-200 devtest (1.012 frases), chrF | 57,03 |
| Decodificación | Greedy |
| Memoria tras carga (Linux, `disable_quant_qdq = 1`) | 527 → 282 MiB (-47 %) |
| Memoria tras carga (Windows, `disable_quant_qdq = 1`) | 502 → 259 MiB (-48 %) |
| Memoria tras carga (Linux, valores por defecto ONNX Runtime) | 281 → 220 MiB (-22 %) |
| Memoria tras carga (Windows, valores por defecto ONNX Runtime) | 196 → 165 MiB (-15 %) |
| Aceleración del decoder | 2,3-2,5× |
| Tokens idénticos al original | Sí |

Entorno de medida: ONNX Runtime 1.31.1, CPU, 4 hilos (Linux; Windows en máquina virtual).

## Requisitos de hardware

- VRAM: no requiere GPU; funciona en CPU con ONNX Runtime.
- Memoria RAM tras la carga: aproximadamente 259-282 MiB con `disable_quant_qdq = 1`; 165-220 MiB con los valores por defecto de ONNX Runtime.
- GPU recomendadas: no aplica; el modelo está diseñado para CPU.
- Cabe en cualquier GPU de consumo, aunque no es su escenario objetivo.
- Despliegue: Transformers.js (navegador o Node.js) y ONNX Runtime en Python (con sentencepiece y numpy). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras absolutas de latencia o throughput; solo la aceleración relativa de 2,3-2,5× frente al decoder original.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Memoria tras carga | Licencia |
|---|---|---|---|---|---|
| OptimaMT/ru-en | Marian | ru → en | ONNX (Transformers.js) | 259-282 MiB (modo rápido) | CC BY 4.0 |
| Xenova/opus-mt-ru-en | Marian | ru → en | ONNX (Transformers.js) | 502-527 MiB (modo rápido) | CC BY 4.0 |
| Helsinki-NLP/opus-mt-ru-en | Marian | ru → en | PyTorch (safetensors/bin) | no disponible | CC BY 4.0 |

OptimaMT/ru-en mantiene los mismos pesos, tokens y calidad (BLEU 28,51, chrF 57,03 en FLORES-200) que Xenova/opus-mt-ru-en, con aproximadamente la mitad de memoria y una aceleración de 2,3-2,5×. Frente al original de Helsinki-NLP, la diferencia principal es el empaquetado ONNX orientado a CPU y navegador.

## Limitaciones y advertencias

- Modelo unidireccional: solo traduce de ruso a inglés; no soporta el sentido inverso ni otros pares.
- Sesgos: al derivar de OPUS-MT, puede heredar sesgos presentes en los corpus de entrenamiento originales; no se documentan análisis específicos.
- Riesgo de alucinación y errores de traducción en dominios especializados, texto informal o frases ambiguas; la evaluación se limita a FLORES-200.
- Ventana de contexto: no documentada; Marian está pensado para frases o párrafos cortos, no para documentos largos.
- Restricciones de licencia: CC BY 4.0 exige atribución a OPUS-MT (Universidad de Helsinki) y a Xenova por la exportación ONNX; permite uso comercial con atribución.
- Dependencia de ONNX Runtime: el modo rápido requiere `disable_quant_qdq = 1`; sin él, la ganancia de memoria se reduce al 15-22 %.
- No soporta tool calling, agentes ni multimodalidad; su alcance es exclusivamente la traducción.
- Solo se reconstruye el decoder fusionado cuantizado; el resto de archivos provienen del modelo base y comparten sus limitaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/ru-en
- Modelo base (Xenova): https://huggingface.co/Xenova/opus-mt-ru-en
- OPUS-MT original (Helsinki-NLP): https://huggingface.co/Helsinki-NLP/opus-mt-ru-en
- Repositorio OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodológico (REPORT.md): https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Colección de los 51 pares: https://huggingface.co/collections/OptimaMT/optimamt-lighter-opus-mt-onnx-models-6af228dc9cd91f015e56e869
- OpenCircle (aplicación que lo usa): https://github.com/AmerAlreyahi/OpenCircle
