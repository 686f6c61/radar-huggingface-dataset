# Prannesshkva/ROTOR-50M-MoE

## Resumen

ROTOR-50M-MoE es un modelo fundacional de secuencias basado en una arquitectura de mezcla de expertos (MoE) diseñada por Prannessh K.V.A. Su innovación principal reside en sustituir el mecanismo de atención por marcos rotacionales cuaterniónicos tridimensionales basados en el grupo de Lie SU(2), lo que elimina por completo la matriz de atención y reduce la huella de estado a un valor constante de 4,50 kilobytes independientemente de la longitud de la secuencia. El modelo combina 48 cabezas rotacionales por capa con 8 expertos SwiGLU y enrutamiento Top-2, activando aproximadamente 17,97 millones de parámetros por token.

El modelo está orientado a tareas multimodales como reconocimiento de voz, alineación visión-lenguaje y codificación cruzada audio-texto, posicionándose como una alternativa a arquitecturas basadas en atención como Whisper. Aunque el repositorio declara 64 millones de parámetros totales, los pesos reales en safetensors contienen 96,35 millones de parámetros, una discrepancia que conviene tener en cuenta. El proyecto se distribuye bajo una triple licencia (AGPLv3, PolyForm no comercial y licencia comercial), lo que condiciona su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ROTOR (Rotational Orientation Token Organization & Recall), MoE con 48 cabezas cuaterniónicas SU(2) por capa, sin atención |
| Parametros totales | 96.350.112 (segun safetensors); 64.044.192 declarados en la model card |
| Parametros activos | 17.965.344 (Top-2 routing sobre 8 expertos SwiGLU) |
| Longitud de contexto | no disponible (el estado es O(1), independiente de la longitud) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles |
| Licencia | Triple licencia: AGPLv3, PolyForm Noncommercial 1.0.0, y licencia comercial propietaria |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura ROTOR sustituye el mecanismo de atención por operaciones de rotación en el espacio tridimensional usando cuaterniones, concretamente elementos del grupo SU(2). Cada capa contiene 48 cabezas rotacionales independientes que transforman las representaciones de los tokens mediante rotaciones, en lugar de calcular productos de atención entre consultas y claves. Esto proporciona una complejidad temporal estrictamente lineal O(N + M) y un estado de contexto de tamano fijo de 4,50 kilobytes, independientemente de la longitud de la secuencia procesada.

El componente MoE integra 8 expertos SwiGLU con enrutamiento Top-2 y una perdida auxiliar de balanceo de carga tipo GShard. La configuracion base incluye 6 bloques, una dimension oculta de 384 y un vocabulario de 8192 tokens. El modelo acepta dos flujos de entrada: un flujo de contexto (que puede ser texto, audio o vision) y un flujo de consulta, lo que permite su uso en tareas de generacion condicionada. No se ha publicado informacion sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto condicionada a un flujo de contexto, con soporte para entradas de longitud variable sin crecimiento del estado interno.
- Procesamiento multimodal nativo: acepta directamente formas de onda de audio a 16 kHz y tensores de imagen RGB de 224x224 mediante codificadores externos incluidos en el repositorio.
- Codificacion cruzada audio-texto y vision-texto sin matriz de atencion, lo que reduce el coste computacional en secuencias largas.
- Razonamiento sobre secuencias con complejidad temporal lineal, adecuado para aplicaciones en tiempo real o con recursos limitados.
- Capacidad de balanceo de carga entre expertos mediante perdida auxiliar GShard, lo que mejora la eficiencia del entrenamiento distribuido.
- Soporte de inferencia con codigo personalizado (custom code) en el ecosistema Transformers, con clases RotorForConditionalGeneration y RotorConfig.

## Casos de uso

- Reconocimiento de voz en tiempo real: el modelo puede procesar formas de onda de audio directamente y generar transcripciones de texto, con un coste de estado constante que lo hace adecuado para streaming continuo en dispositivos con memoria limitada.
- Transcripcion de audio de larga duracion: al mantener un estado de contexto fijo de 4,50 kB, puede procesar podcasts o grabaciones extensas sin degradacion por ventana de contexto, algo que los modelos basados en atencion cuadratica no pueden garantizar.
- Alineacion vision-lenguaje para accesibilidad: combinado con el codificador de vision, puede generar descripciones de imagenes para personas con discapacidad visual, ejecutable en hardware de gama media.
- Asistentes de voz embebidos: su tamano reducido (menos de 100 millones de parametros) y su complejidad lineal permiten su despliegue en dispositivos edge como Raspberry Pi o telefonos moviles para interaccion por voz.
- Codificacion cruzada audio-texto para busqueda multimodal: puede indexar contenido de audio y asociarlo con descripciones textuales, habilitando busquedas semanticas en archivos de audio o video.
- Prototipado de investigacion en arquitecturas sin atencion: sirve como banco de pruebas para estudiar alternativas a los transformers en tareas de secuencia, gracias a su codigo abierto bajo AGPLv3 y su documentacion tecnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval, GSM8K ni comparaciones con modelos similares. Tampoco se proporcionan datos de latencia o throughput medidos en hardware especifico.

## Requisitos de hardware

- VRAM estimada para inferencia: con 96,35 millones de parametros, en FP32 se requieren aproximadamente 385 MB; en FP16 unos 193 MB; en INT8 unos 96 MB. Cabe en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en FP16. Una RTX 3060 o superior permite ejecutar el modelo con margen para el codigo de los codificadores multimodales.
- Compatibilidad con consumer GPU: si, el modelo cabe en GPUs de gama de entrada como GTX 1650 o RTX 3050, siempre que se use cuantizacion o FP16.
- Opciones de despliegue: el repositorio incluye codigo para Transformers con trust_remote_code. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, por lo que el despliegue se limita al codigo personalizado del autor.
- Latencia y throughput: no disponible. Al ser una arquitectura sin atencion con complejidad lineal, se espera un rendimiento favorable en secuencias largas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en el ecosistema open source, dado que la arquitectura ROTOR es unica y no existen implementaciones alternativas publicadas. Como referencia aproximada por tamano, se pueden considerar modelos MoE como Mixtral-8x7B (46,7 B totales, 12,9 B activos) o modelos lineales como Mamba-130M, pero las diferencias arquitectonicas y de proposito (multimodal vs. texto) hacen que la comparacion no sea significativa. No disponible.

## Limitaciones y advertencias

- La licencia es restrictiva: la combinacion de AGPLv3 y PolyForm Noncommercial impide el uso comercial sin una licencia separada, que debe solicitarse directamente al autor. Esto limita seriamente su adopcion en productos empresariales.
- No se han publicado datos de entrenamiento, por lo que se desconocen los sesgos potenciales del modelo y la calidad de sus datos de origen.
- No hay benchmarks publicados, lo que impide evaluar su rendimiento real frente a alternativas establecidas como Whisper o modelos de vision-lenguaje convencionales.
- El codigo depende de archivos personalizados (modeling_rotor.py, configuration_rotor.py, multimodal_encoders.py) que requieren trust_remote_code, lo que introduce riesgos de seguridad y mantenibilidad en entornos de produccion.
- La discrepancia entre los parametros declarados (64 M) y los reales en safetensors (96 M) sugiere una documentacion imprecisa que conviene verificar antes de planificar recursos.
- El modelo solo soporta ingles, lo que limita su uso en aplicaciones multilingues.
- No se ha demostrado la capacidad de tool calling, function calling ni razonamiento multi-paso, por lo que no es adecuado para tareas de agente autonomo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Prannesshkva/ROTOR-50M-MoE
- DOI del articulo: https://doi.org/10.5281/zenodo.22285756
- Licencia CC BY-NC-ND 4.0: https://creativecommons.org/licenses/by-nc-nd/4.0/
- Perfil del autor: https://huggingface.co/Prannesshkva
- Modelo relacionado Ael-504M: https://huggingface.co/Prannesshkva/Ael-504M
