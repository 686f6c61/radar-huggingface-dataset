# KeelCore/KeelCore-750M-Grammar

## Resumen

KeelCore-750M-Grammar es un adaptador LoRA de rango 16 (18,29 M de parametros entrenables, el 2,43 % del modelo base) construido sobre Thelivu-750M, un modelo encoder-decoder de 750 M de parametros. Lo desarrolla KeelCore, aunque la model card reproduce integramente la documentacion del adaptador original de Thelivu (autor Saravanan A R), lo que sugiere una redistribucion o fork del adaptador Thelivu-750M-Grammar bajo el identificador KeelCore. Su tarea es concreta: corregir ortografia, gramatica, mayusculas y puntuacion en ingles manteniendo la redaccion, el tono y el significado originales.

El modelo resuelve un problema acotado y frecuente en produccion: la correccion automatica de texto en ingles sin reescritura creativa. Al ser un encoder-decoder, lee la entrada completa antes de generar, lo que le permite copiar literalmente nombres propios, URL y direcciones de correo sin alterarlos. El adaptador ocupa 73 MB (repositorio de 0,3 GB) y necesita el modelo base congelado para funcionar; no es un modelo autonomo.

Es relevante ahora por su perfil de despliegue: cabe en CPU y en navegador mediante ONNX Runtime Web, lo que habilita correccion de texto en local sin enviar datos a un servidor. La licencia Thelivu License 1.0 (etiquetada como "other") y el soporte exclusivo de ingles limitan su alcance, pero lo posicionan como una pieza ligera y especializada dentro de pipelines de edicion de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 16) sobre modelo base encoder-decoder Thelivu-750M |
| Parametros totales | 18,29 M entrenables en el adaptador (2,43 % del base); base de 750 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (salida limitada a 384 tokens nuevos con ajustes por defecto) |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors; existe variante ONNX para navegador) |
| Idiomas soportados | Ingles (en) |
| Licencia | Thelivu License, Version 1.0 (etiqueta "other") |
| Formato de pesos | `adapter.safetensors` + `adapter_config.json` en formato propietario Thelivu (no PEFT); variante ONNX |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Thelivu-750M, un transformer encoder-decoder de 750 M de parametros. La eleccion de encoder-decoder es deliberada: el modelo codifica la secuencia completa antes de decodificar, lo que facilita la copia fiel de fragmentos exactos (nombres, URL, correos, telefonos) y reduce el riesgo de alterar texto que debe permanecer intacto. El adaptador es un LoRA de rango 16 con 18,29 M de parametros entrenables, almacenado en un unico archivo de 73 MB.

El entrenamiento se centra casi exclusivamente en ejemplos que contienen errores, con el objetivo de que la salida mantenga una longitud cercana a la entrada (diferencia media inferior al 1 %) y una alta similitud caracter a caracter (94 chrF). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. El adaptador incluye un mecanismo de verificacion de huella (fingerprint) de los pesos base que impide cargarlo sobre cualquier modelo distinto de Thelivu-750M.

## Capacidades

- Correccion de ortografia en ingles, incluidos errores tipicos de escritura (recieve, definately, tommorow).
- Correccion gramatical: concordancia sujeto-verbo, tiempos verbales, condicionales y formas como "would of" por "would have".
- Correccion de mayusculas, incluidos nombres propios y toponimos (canada por Canada).
- Correccion de puntuacion y segmentacion de oraciones.
- Preservacion de texto exacto: URL, direcciones de correo y numeros de telefono se copian sin modificacion.
- Modo corrector, no reescritor: mantiene el tono y la redaccion originales, con desviacion de longitud inferior al 1 %.
- Ejecucion en CPU, GPU con PyTorch o navegador mediante ONNX Runtime Web.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- No es un modelo conversacional: no responde preguntas ni sigue instrucciones contenidas en el texto.

## Casos de uso

- Correccion de borradores en aplicaciones de mensajeria y correo: el adaptador procesa mensajes y emails cortos y devuelve el texto con los errores eliminados, manteniendo nombres y direcciones intactos gracias a la arquitectura encoder-decoder.
- Reescritura en local sin salida de datos: al ejecutarse en CPU o en navegador con ONNX Runtime Web, permite corregir texto sensible sin enviarlo a un servidor externo, lo que encaja en entornos con requisitos de privacidad.
- Preprocesado en pipelines de tickets de soporte: se puede insertar como paso previo a la clasificacion o al enrutamiento de tickets para normalizar la ortografia y la puntuacion antes del analisis.
- Correccion de notas y documentacion corta: util para normalizar notas internas, actas o documentacion breve antes de su publicacion o archivado.
- Paso de control de calidad en herramientas de escritura: integrado como capa final de correccion en editores o correctores, con la advertencia de que no debe aplicarse a codigo, configuracion ni cifras financieras.
- Base para investigacion sobre adaptadores pequenos: sirve como punto de partida para estudiar el comportamiento de adaptadores LoRA de bajo rango sobre un modelo base compartido y congelado.
- Correccion de formularios y campos de texto libre: normaliza la entrada del usuario en registros y formularios antes de almacenarla, siempre que no se requiera preservar cada caracter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas internas del adaptador: salida dentro del 1 % de la longitud de la entrada y 94 chrF de coincidencia a nivel de caracter con el texto de entrada en el conjunto de validacion.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el adaptador pesa 73 MB y el modelo base 750 M de parametros, por lo que la inferencia completa cabe holgadamente en GPU de consumo (estimacion orientativa de 2-4 GB en fp16, no confirmada en la informacion disponible).
- GPU recomendadas: no especificadas; cualquier GPU con soporte PyTorch es suficiente por el tamano del modelo base.
- CPU: soportada explicitamente; el adaptador esta disenado para ejecutarse en CPU.
- Navegador: soportado mediante ONNX Runtime Web.
- Opciones de despliegue: PyTorch con el codigo del repositorio Thelivu (obligatorio, ya que el formato del adaptador no es PEFT), ONNX Runtime Web. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KeelCore-750M-Grammar | 18,29 M (adaptador) + 750 M base | No disponible | Correccion gramatical en ingles | Thelivu License 1.0 | Hugging Face |
| Thelivu-750M-Grammar (original) | 18,29 M (adaptador) + 750 M base | No disponible | Correccion gramatical en ingles | Thelivu License 1.0 | Hugging Face |
| Thelivu-750M (base) | 750 M | No disponible | Generacion de texto encoder-decoder | Thelivu License 1.0 | Hugging Face |

No se dispone en la informacion proporcionada de datos de rendimiento de modelos alternativos de correccion gramatical (por ejemplo, modelos tipo GECToR o T5 ajustados para GEC) que permitan una comparacion cuantitativa fiable. La unica comparacion directa posible es con el adaptador original de Thelivu, del que KeelCore-750M-Grammar parece ser una redistribucion con documentacion identica.

## Limitaciones y advertencias

- Solo ingles: no soporta otros idiomas, incluido el castellano.
- No es un modelo conversacional ni sigue instrucciones; solo corrige el texto que recibe.
- Sesgo de edicion: al haberse entrenado casi exclusivamente con ejemplos erroneos, tiende a modificar texto que ya es correcto.
- Texto muy degradado: puede introducir errores nuevos en entradas gravemente corruptas.
- No apto para contenido donde cada caracter debe preservarse: codigo, configuracion, numeros de version, cifras financieras y citas literales.
- No cambia el estilo ni el tono: no hace el texto mas formal, mas corto ni mas largo.
- Licencia Thelivu License 1.0: es necesario revisar sus terminos para uso comercial, ya que se etiqueta como "other" y no como licencia permisiva estandar.
- Dependencia estricta del modelo base: el cargador verifica la huella de los pesos y rechaza cualquier base distinta de Thelivu-750M.
- Formato propietario: el adaptador no usa el formato PEFT, por lo que requiere el codigo del repositorio Thelivu y no es compatible directamente con herramientas estandar como PEFT o vLLM.
- Riesgo de alucinacion: no se documenta de forma especifica; el diseno orientado a la copia reduce el riesgo en fragmentos exactos, pero no hay evaluacion publica al respecto.
- Posible duplicacion: la ficha reproduce la documentacion del adaptador original de Thelivu, lo que conviene verificar antes de adoptarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/KeelCore/KeelCore-750M-Grammar
- Modelo base: https://huggingface.co/Thelivu/Thelivu-750M
- Adaptador original de referencia: https://huggingface.co/Thelivu/Thelivu-750M-Grammar
- Informe tecnico: https://saravanan-a-r.github.io/Thelivu/
- Repositorio GitHub: https://github.com/saravanan-a-r/Thelivu
- Licencia: https://huggingface.co/Thelivu/Thelivu-750M-Grammar/blob/main/LICENSE
