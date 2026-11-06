# Sido/hina-gemma4-e4b-aggressive-onnx

## Resumen

Sido/hina-gemma4-e4b-aggressive-onnx es una conversión a ONNX Runtime Web del modelo HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive, un ajuste fino no censurado de Gemma 4 E4B. La conversión la firma el usuario Sido y está pensada exclusivamente para inferencia en navegador mediante transformers.js y el backend WebGPU. El resultado es un modelo de generación de texto con cuantización q4f16, derivado a su vez de un GGUF Q4_K_M que fue dequantizado y recuantizado, por lo que acumula dos pasos de pérdida de precisión respecto a los pesos originales.

El modelo base pertenece a la familia Gemma 4 en su variante E4B, una arquitectura transformer con atención multimodal en origen (image-text-to-text). Sin embargo, esta conversión concreta es solo de texto: los codificadores de visión y audio no están incluidos, y el autor indica que únicamente se ha probado la generación de texto. El repositorio ocupa 4,9 GB y no registra descargas ni interacciones en el momento de redactar esta ficha.

Su relevancia es acotada y muy específica: sirve como ejemplo de despliegue de un modelo Gemma 4 cuantizado en el navegador con WebGPU, útil para prototipos de aplicaciones cliente sin servidor. No es un modelo recomendado para producción ni para evaluación de calidad, dado que el propio autor advierte que el comportamiento y la calidad del modelo original no se han evaluado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, variante E4B); conversión solo texto |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f16 (ONNX Runtime Web); origen Q4_K_M GGUF |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | ONNX (repo de 4,9 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 4 E4B, un transformer de la familia Gemma. El modelo base es un ajuste fino no censurado denominado "Aggressive" publicado por HauhauCS, del que no se dispone de detalles sobre el dataset de ajuste, el número de tokens utilizados ni si se emplearon técnicas de RLHF o DPO. La model card de esta conversión no aporta información sobre el entrenamiento original.

La innovación técnica de esta ficha no está en el entrenamiento, sino en el pipeline de conversión: los tensores del GGUF Q4_K_M se dequantizaron y se recuantizaron al formato q4f16 de ONNX Runtime Web. Los grafos de computación, el tokenizador y la configuración provienen de onnx-community/gemma-4-E4B-it-ONNX en la revisión 2b6d2e26a962f70a33da8f7cd81e1afdd8d9cfb2. El autor advierte explícitamente que la conversión no es bit-idéntica al Q4_K_M y que añade un paso adicional de cuantización con pérdida. El script de conversión está publicado en el repositorio hina5.

## Capacidades

- Generación de texto conversacional en navegador mediante transformers.js y WebGPU.
- Plantilla de chat compatible con el tokenizador de Gemma 4, con opción `enable_thinking` en la plantilla (desactivada en el ejemplo del autor).
- Generación determinista disponible mediante `do_sample: false`.
- El modelo base es multimodal (image-text-to-text), pero esta conversión no incluye los codificadores de visión ni de audio.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingües: no disponibles; el ejemplo de la model card usa una frase en japonés, pero no se declara cobertura de idiomas.

## Casos de uso

- Prototipado de chat en el navegador: permite cargar el modelo con `Gemma4ForCausalLM.from_pretrained` y el dtype q4f16 sobre WebGPU, útil para validar una interfaz conversacional sin backend.
- Demos de inferencia local sin servidor: al ejecutarse en el cliente, evita enviar prompts a una API y sirve para experimentar con privacidad por diseño en aplicaciones web.
- Evaluación de la cadena de conversión GGUF a ONNX q4f16: el repositorio y su script permiten reproducir el pipeline y medir la degradación introducida por la doble cuantización.
- Generación de texto creativo sin filtros en entornos controlados: el ajuste "uncensored" del modelo base permite explorar respuestas que los modelos alineados rechazan, siempre con revisión humana.
- Pruebas de compatibilidad de transformers.js: sirve para verificar el soporte de la clase Gemma4ForCausalLM y del backend WebGPU en distintas versiones de la librería.
- Educación sobre cuantización: el contraste entre Q4_K_M y q4f16 en un mismo modelo base es un caso práctico para explicar la pérdida acumulada de precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que el comportamiento y la calidad del modelo original no se han evaluado de forma independiente.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repo pesa 4,9 GB en formato ONNX q4f16, por lo que se requiere memoria suficiente para cargar los pesos y el grafo en el dispositivo.
- GPU recomendadas: no disponible. El backend objetivo es WebGPU, por lo que se necesita un navegador con soporte WebGPU y una GPU compatible.
- ¿Cabe en GPU de consumo? No confirmado por el autor; el tamaño del repo sugiere que encaja en GPUs de consumo con memoria suficiente, pero no hay validación publicada.
- Opciones de despliegue: transformers.js con `device: 'webgpu'` y `dtype: 'q4f16'`; el modelo base también existe en GGUF para llama.cpp, pero esta conversión concreta es ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Sido/hina-gemma4-e4b-aggressive-onnx | no disponible | no disponible | ONNX q4f16 | gemma | Solo texto, orientado a navegador, doble cuantización |
| HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive | no disponible | no disponible | GGUF Q4_K_M | gemma | Modelo base, sin conversión ONNX |
| onnx-community/gemma-4-E4B-it-ONNX | no disponible | no disponible | ONNX | gemma | Conversión oficial de la variante instruct, sin ajuste no censurado |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- La conversión no es bit-idéntica al Q4_K_M original: acumula una segunda cuantización con pérdida sobre unos pesos ya cuantizados.
- Solo se ha probado la generación de texto; los codificadores de visión y audio del modelo base no están incluidos.
- El autor no ha evaluado de forma independiente la calidad ni el comportamiento del modelo.
- El ajuste "uncensored" del modelo base implica un mayor riesgo de generar contenido inapropiado, ofensivo o dañino; requiere filtrado y supervisión en cualquier uso real.
- No hay información sobre sesgos, idiomas soportados ni alucinación medidos para esta variante.
- La licencia gemma impone los Gemma Terms of Use, que incluyen restricciones de uso; además aplican los términos del modelo original. Es necesario revisarlos antes de cualquier uso comercial.
- El repositorio no registra descargas ni validación de la comunidad, lo que reduce la confianza en su estabilidad.
- El ejemplo de la model card usa `enable_thinking: false`; el comportamiento con el modo thinking activado no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sido/hina-gemma4-e4b-aggressive-onnx
- Modelo base (GGUF): https://huggingface.co/HauhauCS/Gemma-4-E4B-Uncensored-HauhauCS-Aggressive
- Conversión ONNX de referencia: https://huggingface.co/onnx-community/gemma-4-E4B-it-ONNX
- Script de conversión: https://github.com/mazariba/hina5/blob/main/browser/scripts/build-aggressive-onnx.py
- Repositorio hina5: https://github.com/mazariba/hina5
- Términos de licencia Gemma: no disponible en la información proporcionada
