# Aletheia-ng/gemma-3-0.8b-translate-Q8

## Resumen

gemma-3-0.8b-translate-Q8 es la version cuantizada a 8 bits (Q8_0) en formato GGUF de `Aletheia-ng/gemma-3-1b-translate-best`, un modelo de traduccion derivado de Google Gemma 3 y ajustado por Aletheia AI para traducir exclusivamente de ingles a 125 lenguas africanas. El autor ha recortado el vocabulario original de Gemma 3 de 262.144 a 111.966 tokens eliminando piezas nunca usadas durante el entrenamiento y la evaluacion, lo que reduce el modelo a 826.880.896 parametros (0,83B) y un repositorio de 0,9 GB.

La relevancia del modelo reside en su especializacion: cubre idiomas africanos de bajos recursos (yoruba, hausa, suajili, zulu, amharico, wolof, bamana, entre otros muchos) con un modelo pequeno que cabe en hardware modesto. El ajuste se realizo con GRPO (aprendizaje por refuerzo) sobre el modelo base, y el resultado en el modelo de precision completa alcanza chrF++ 35,28 en FLORES+ devtest con 54 lenguas.

Se distribuye como un unico fichero GGUF autocontenido con la plantilla de chat de Gemma y todas las etiquetas de idioma conservadas, pensado para ejecutarse con llama.cpp o llama-cpp-python tanto en CPU como en GPU. La licencia permite uso comercial con atribucion obligatoria al autor y sujeta tambien a los terminos de uso de Gemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Gemma 3), ajustado con GRPO |
| Parametros totales | 826.880.896 (0,83B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso emplea `n_ctx=4096`) |
| Tipos de cuantizacion | Q8_0 (8 bits), unica variante en este repositorio |
| Idiomas soportados | Ingles (origen) y 125 lenguas africanas de destino (yoruba, hausa, igbo, suajili, zulu, xhosa, amharico, wolof, bamana, etc.) |
| Licencia | other: uso comercial libre con atribucion obligatoria a "Translation models by Aletheia AI" y citacion del paper; se aplican ademas los Gemma Terms of Use y la Prohibited Use Policy |
| Formato de pesos | GGUF (fichero `gemma-3-0.8b-translate-Q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer decoder-only de Gemma 3, en concreto de una variante de aproximadamente 1B parametros, y ha sido especializado mediante GRPO (Group Relative Policy Optimization), una tecnica de aprendizaje por refuerzo que el autor etiqueta explicitamente en el repositorio. El resultado es un modelo de traduccion unidireccional ingles a lenguas africanas que responde con una etiqueta de idioma como token unico seguida de la traduccion.

La innovacion tecnica mas destacable de esta version es la poda del vocabulario: se eliminan los tokens que el texto de entrenamiento y evaluacion nunca utilizo (piezas raras, secuencias largas de espacios, tokens de etiquetas HTML y huecos sin uso) junto con sus filas de embedding, pasando de 262.144 a 111.966 tokens. Se conservan las 125 etiquetas de idioma y todos los tokens especiales (`<bos>`, `<eos>`, `<pad>`, `<unk>`, `<mask>`, `[multimodal]`, `<start_of_turn>`, `<end_of_turn>`, `<start_of_image>`, `<end_of_image>`). Como consecuencia, los identificadores de token ya no coinciden con los originales de Gemma (por ejemplo, `<yor>` es el id 6 y `<hau>` el 7), pero el tokenizador incluido en el GGUF es autocontenido. El autor verifico sobre 16 prompts de prueba en 8 idiomas que la version podada produce exactamente la misma traduccion que el GGUF de vocabulario completo con los mismos pesos. La conversion se realizo con llama.cpp.

## Capacidades

- Traduccion unidireccional de ingles a 125 lenguas africanas, con etiquetas de idioma dedicadas en el vocabulario.
- Respuesta con etiqueta de idioma de salida como token unico (por ejemplo `<yor>`), lo que facilita el postprocesado y el enrutado.
- Generacion de texto breve: frases sueltas o parrafos cortos por peticion.
- Conversacion de un unico turno de usuario mediante la plantilla de chat de Gemma embebida en el GGUF.
- Ejecucion en CPU y GPU a traves de llama.cpp y llama-cpp-python.
- No soporta tool calling, function calling, agentes, vision ni audio segun la informacion disponible.
- Capacidad multilingue limitada al par ingles-lenguas africanas; no se documenta traduccion entre lenguas africanas ni hacia el ingles.

## Casos de uso

- Traduccion de documentacion tecnica a lenguas africanas: el modelo traduce frases o parrafos cortos de ingles a idiomas como suajili o hausa; para documentos largos el autor recomienda dividir el texto en frases y traducirlas por separado.
- Localizacion de interfaces y cadenas de aplicacion: al devolver una etiqueta de idioma como token unico, un pipeline puede validar la salida y encadenar el postprocesado con una expresion regular (`re.sub(r"^<[a-z]{3}>\s*", "", text)`).
- Atencion al cliente en mercados africanos: con 125 idiomas de destino, un servicio puede ofrecer respuestas en la lengua del usuario partiendo de textos en ingles, ejecutando el modelo en CPU o en una GPU consumer.
- Traduccion de contenidos agricolas y sanitarios: los ejemplos del autor incluyen frases sobre precipitaciones y cosechas de maiz o horarios de clinicas, ambitos donde la cobertura de lenguas de bajos recursos es escasa.
- Procesamiento por lotes en servidores modestos: el fichero GGUF de 0,9 GB y la cuantizacion Q8_0 permiten desplegar el modelo en maquinas sin GPU dedicada mediante llama.cpp en modo CPU.
- Integracion en aplicaciones Python: llama-cpp-python expone `create_chat_completion` con la plantilla de chat embebida, lo que simplifica su inclusion en servicios web o scripts de traduccion automatizada.
- Investigacion en traduccion automatica de bajas recursos: sirve como referencia pequena y reproducible para comparar tecnicas de ajuste (GRPO) y de poda de vocabulario sobre lenguas africanas.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden al modelo de precision completa del que deriva esta cuantizacion, no al GGUF Q8_0 en si. El autor indica que la version podada produce las mismas traducciones que el GGUF de vocabulario completo en las 16 pruebas realizadas.

| Benchmark | Metrica | Resultado (modelo de precision completa) |
|---|---|---|
| FLORES+ devtest (54 lenguas) | chrF++ | 35,28 |
| FLORES+ devtest (54 lenguas) | spBLEU | 14,03 |
| FLORES+ devtest (40 lenguas) | AfriCOMET | 0,681 |
| NTREX-128 (24 lenguas) | chrF++ | 40,05 |
| MAFAND-MT (15 lenguas) | chrF++ | 44,21 |

La decodificacion empleada en los benchmarks fue greedy y `max_new_tokens=768`. No se han publicado resultados de benchmarks especificos para el fichero Q8_0 en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 0,83B parametros en Q8_0, los pesos ocupan aproximadamente 0,9 GB; con la cache KV y el contexto de 4096 tokens el consumo total se mantiene en el rango de 1-2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor probo el modelo con backend Metal en Apple. No se documentan pruebas con A100, H100 ni RTX 4090 en la informacion disponible.
- Cabe holgadamente en GPU consumer (GTX 1650, RTX 3060, RTX 4090, entre otras) y tambien en CPU.
- Opciones de despliegue: llama.cpp (`llama-completion`, `llama-cli`, servidor con endpoint de chat) y llama-cpp-python. El autor no menciona vLLM, TGI ni Ollama.
- Ajustes de ejecucion: `-ngl 99` para cargar todas las capas en GPU o `n_gpu_layers=0` para CPU; no escribir `<bos>` en el prompt porque llama.cpp lo anade automaticamente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. Como referencia estructural:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-3-0.8b-translate-Q8 | 0,83B | no disponible | Ingles a 125 lenguas africanas | other (comercial con atribucion, sujeto a Gemma Terms) | GGUF |
| Aletheia-ng/gemma-3-1b-translate-best (modelo base) | no disponible | no disponible | Ingles a 125 lenguas africanas | other (comercial con atribucion) | safetensors (presumiblemente) |
| Gemma 3 original | no disponible para la variante de 1B | no disponible | Multilingue general | Gemma Terms of Use | safetensors, GGUF |

No se han publicado comparativas con otros sistemas de traduccion para lenguas africanas en la informacion disponible.

## Limitaciones y advertencias

- Traduccion exclusivamente unidireccional: solo ingles a lenguas africanas; no traduce hacia el ingles ni entre lenguas africanas.
- Una frase o un parrafo corto por peticion; el autor recomienda dividir documentos largos en frases para obtener mejores resultados.
- El prompt debe usar el nombre del idioma (por ejemplo "Yoruba"), nunca el codigo ISO; la etiqueta de salida es solo un marcador que hay que eliminar en el postprocesado.
- Los identificadores de token no coinciden con los de Gemma original debido a la poda del vocabulario, lo que rompe la compatibilidad con herramientas que asuman el vocabulario estandar de Gemma 3.
- Riesgo de alucinacion y de traducciones imprecisas en lenguas con pocos datos, dado el tamano reducido del modelo (0,83B) y la cobertura desigual entre los 125 idiomas.
- No se documentan sesgos especificos ni evaluaciones de seguridad en la informacion disponible.
- Licencia de uso comercial permitida solo con atribucion obligatoria ("Translation models by Aletheia AI") y citacion del paper; se aplican ademas los Gemma Terms of Use y la Prohibited Use Policy de Google.
- No se documenta soporte de tool calling, agentes, vision ni audio; no debe asumirse ninguna de estas capacidades en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Aletheia-ng/gemma-3-0.8b-translate-Q8
- Modelo base (precision completa): https://huggingface.co/Aletheia-ng/gemma-3-1b-translate-best
- Paper de referencia: citado en la model card como "the accompanying paper"; no se proporciona el enlace en la informacion disponible.
- Repositorio de llama.cpp: no se proporciona enlace en la informacion disponible.
