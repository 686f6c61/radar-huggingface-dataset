# Panga-Azazia/LFM2.5-350M-TTS-v3

## Resumen

Panga-Azazia/LFM2.5-350M-TTS-v3 es un ajuste fino (fine-tune) de tipo supervisado del modelo Panga-Azazia/LFM2.5-350M-TTS, publicado por el usuario Panga-Azazia en HuggingFace. Se trata de un modelo de generacion de texto de la familia LFM2 (Liquid Foundation Model 2) de Liquid AI, con 382.682.880 parametros reales (unos 383 M) y un repositorio de 0,8 GB en formato safetensors. El entrenamiento se ha realizado con las librerias TRL y Unsloth, y la tarjeta indica la etiqueta `generated_from_trainer`, lo que confirma un pipeline de SFT sobre el modelo base citado. El acceso esta restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargarlo.

El interes de la ficha radica en dos factores. Primero, la familia LFM2.5 de Liquid AI esta disenada para inferencia muy rapida en hardware modesto, incluyendo CPU, gracias a la arquitectura LFM2 descrita en su informe tecnico; segun el blog de Liquid AI, la variante LFM2.5-350M amplia el preentrenamiento de 10 a 28 billones de tokens e incorpora aprendizaje por refuerzo a gran escala. Segundo, este repositorio concreto es un fine-tune de segunda generacion (un ajuste sobre otro ajuste), con lo que conviene tratarlo como un experimento de la comunidad mas que como un artefacto con garantias de calidad.

La informacion publicada es muy escasa: no hay tarjeta de modelo detallada, no se declaran licencia, idiomas, longitud de contexto, dataset de entrenamiento ni resultados de evaluacion. Ademas, el nombre del repositorio incluye el sufijo TTS (text-to-speech) pese a que el pipeline declarado es `text-generation` y el repositorio solo contiene pesos de lenguaje; por tanto, la capacidad de sintesis de voz no esta confirmada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (Liquid Foundation Model 2) de Liquid AI; segun el informe tecnico de la familia, se trata de una arquitectura hibrida. No se detalla en la tarjeta del repositorio |
| Parametros totales | 382.682.880 (aproximadamente 383 M), dato real de los tensores safetensors |
| Parametros activos | No aplica; no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos safetensors, sin versiones GGUF, AWQ o GPTQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible; el repositorio figura como acceso restringido (gated) |
| Formato de pesos | Safetensors (libreria transformers) |
| Pipeline declarado | text-generation |
| Modelo base | Panga-Azazia/LFM2.5-350M-TTS |
| Metodo de ajuste | SFT (supervised fine-tuning) con TRL y Unsloth |
| Tamano del repositorio | 0,8 GB |
| Acceso | Restringido (gated), requiere aceptar condiciones |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura LFM2 de Liquid AI, la misma familia sobre la que se construye LFM2.5-350M. Segun el blog de Liquid AI, LFM2.5-350M es una version mejorada del modelo de 350 M con preentrenamiento ampliado de 10 a 28 billones de tokens y aprendizaje por refuerzo a gran escala, disenada para ofrecer inferencia excepcionalmente rapida tanto en GPU de nube como en CPU economicas. El informe tecnico de LFM2 describe la familia como una columna vertebral de lenguaje sobre la que se construyen variantes multimodales (LFM2-VL, LFM2-Audio) y de recuperacion de informacion (LFM2-ColBERT-350M).

Sobre ese sustrato, este repositorio aplica un ajuste supervisado (SFT) mediante las librerias TRL y Unsloth, partiendo de Panga-Azazia/LFM2.5-350M-TTS, que a su vez es otro ajuste de la misma cadena. La tarjeta no especifica el numero de tokens de entrenamiento, la composicion del dataset, la presencia de etapas de RLHF o DPO, ni hiperparametros como tasa de aprendizaje, epochs o longitud de secuencia. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion, etc.). Se trata, por tanto, de un artefacto de ajuste documentado de forma minima.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` y el pipeline `text-generation` indican que el ajuste esta orientado a mantener dialogos de tipo chat.
- Instrucciones y respuestas de formato libre: al derivar de un SFT, se espera que responda a indicaciones en lenguaje natural, aunque no hay evaluaciones publicadas que lo confirmen.
- Soporte de tool calling / function calling: no disponible; no se menciona en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se menciona.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Vision o audio: no disponible; el repositorio no contiene modulos ni tokenizadores de audio o imagen. Aunque el nombre incluye "TTS", no hay evidencia de capacidad de sintesis de voz en los archivos publicados.
- Ajuste eficiente posterior: el uso de Unsloth en el entrenamiento sugiere compatibilidad con flujos de fine-tuning con LoRA sobre este mismo checkpoint, si bien el repositorio no incluye adaptadores LoRA (existe un repositorio hermano con esa denominacion).

## Casos de uso

- Asistente conversacional en dispositivos con recursos limitados: con 383 M de parametros, el modelo puede ejecutarse en CPU o en GPU de gama baja, lo que permite desplegar un chatbot local en un portatil, una Raspberry Pi con suficiente RAM o un equipo de escritorio sin tarjeta grafica dedicada.
- Prototipado rapido de productos conversacionales: sirve como sustituto barato de modelos mayores durante las fases de diseno de prompts, definicion de flujos de dialogo y validacion de experiencia de usuario, antes de migrar a un modelo de mayor tamano.
- Clasificacion y etiquetado de texto en pipelines de bajo coste: tareas como categorizacion de tickets, deteccion de intencion o extraccion de campos simples pueden resolverse con generacion guiada por prompt, reduciendo el coste por peticion frente a modelos de miles de millones de parametros.
- Generacion de texto auxiliar en entornos air-gapped: al poder ejecutarse en local sin llamadas a API externas, es utilizable en entornos con requisitos de soberania de datos o sin conexion a internet.
- Filtrado y preprocesado de texto para otros sistemas: por ejemplo, normalizacion, resumen corto o reformulacion de entradas antes de pasarlas a un modelo mayor o a un motor de busqueda.
- Base para experimentos de investigacion en SFT: al haber sido entrenado con TRL y Unsloth y estar etiquetado como `generated_from_trainer`, es un punto de partida reproducible para comparar tecnicas de ajuste eficiente, tasas de aprendizaje o tamanos de dataset en modelos pequenos.
- Educacion y demostraciones tecnicas: permite ilustrar en charlas o cursos como se comporta una cadena de fine-tunes sucesivos sobre un mismo linaje de modelos, y como se degrada o mejora la calidad en cada salto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta del modelo no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web no aporta cifras de evaluacion para este checkpoint concreto. El blog de Liquid AI si describe el modelo base LFM2.5-350M, pero las cifras asociadas no se han recuperado en la busqueda realizada.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 0,77 GB solo para los pesos, mas cache KV y activaciones; en la practica conviene reservar entre 1,5 y 2 GB.
- VRAM estimada en INT8: alrededor de 0,4 GB de pesos, con un total practico en torno a 1 GB.
- VRAM estimada en INT4: alrededor de 0,2 GB de pesos, con un total practico en torno a 0,6 GB. Estas cifras son estimaciones aritmeticas a partir del numero de parametros; no se publican cuantizaciones oficiales en el repositorio.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente (GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090, A100, H100). El modelo esta limitado por velocidad de memoria, no por capacidad, por lo que una GPU grande no aporta ventajas proporcionales.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual e incluso en iGPU con memoria unificada suficiente.
- Ejecucion en CPU: viable, y es el escenario natural para este tamano. Requiere del orden de 1 a 2 GB de RAM segun el tipo numerico.
- Opciones de despliegue: transformers es la ruta confirmada por el repositorio. El soporte de vLLM, llama.cpp, Ollama o TGI para este checkpoint concreto no esta confirmado en la informacion disponible; seria necesario exportar los pesos a GGUF o verificar la compatibilidad de la arquitectura LFM2 con cada motor.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Nota sobre acceso: al ser un repositorio gated, la descarga requiere autenticacion con un token de HuggingFace y la aceptacion previa de las condiciones.

## Comparativa con modelos similares

Los valores de este modelo proceden del repositorio consultado. Los de los modelos de referencia se incluyen a modo orientativo a partir de sus tarjetas publicas y no han sido verificados en esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Panga-Azazia/LFM2.5-350M-TTS-v3 | 382,7 M | No disponible | No disponible | Gated en HuggingFace; safetensors; 0 descargas |
| Liquid AI LFM2.5-350M (modelo base de la familia) | 350 M (nominal) | No disponible en la informacion recuperada | No disponible en la informacion recuperada | Publico segun el blog de Liquid AI |
| Panga-Azazia/LFM2.5-350M-TTS (base directa de este ajuste) | No disponible | No disponible | No disponible | Publico en HuggingFace |
| Panga-Azazia/LFM2.5-350M-LORA-TTS | No disponible (adaptadores) | No disponible | No disponible | Publico en HuggingFace |
| Alternativas de ~0,3-0,6 B de otras familias (Qwen3-0.6B, SmolLM2-360M, Gemma 3 270M) | 0,27-0,6 B | No disponible | Licencias permisivas en la mayoria de casos (Apache-2.0 o terminos propios) | Publicas y ampliamente descargadas |

La diferencia practica principal frente a esas alternativas no esta en el rendimiento, que no se ha medido, sino en la trazabilidad: este checkpoint carece de licencia declarada, de idiomas declarados y de evaluaciones, y tiene cero adopcion registrada. Para produccion, un modelo de tamano similar con licencia explicita y comunidad activa es una opcion mas segura.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse terminos de uso, no hay base juridica clara para un despliegue comercial. Conviene contactar con el autor o abstenerse de usarlo en produccion.
- Acceso restringido: el repositorio es gated y exige aceptar condiciones, lo que anade friccion a cualquier integracion automatizada.
- Doble ajuste sucesivo: el modelo es un fine-tune de otro fine-tune de la misma cadena, lo que incrementa el riesgo de sobreajuste, de olvido catastrofico y de degradacion de capacidades generales respecto al modelo original de Liquid AI.
- Ausencia total de evaluacion: sin benchmarks ni validacion humana publicada, no hay forma de estimar su calidad real frente al modelo base.
- Riesgo de alucinacion elevado: con 383 M de parametros, la tasa de afirmaciones incorrectas o incoherentes es estructuralmente alta, especialmente en tareas de conocimiento factual, matematicas o razonamiento multi-paso.
- Contexto e idiomas sin declarar: se desconoce la ventana maxima util y que lenguas cubre el ajuste. No se debe asumir un buen rendimiento en castellano.
- Ambiguedad del nombre TTS: el sufijo sugiere sintesis de voz, pero el pipeline es text-generation y el repositorio no contiene decodificador de audio. No debe usarse como sistema TTS sin verificacion previa.
- Ausencia de cuantizaciones oficiales: no hay GGUF ni formatos optimizados publicados, lo que obliga a generarlos por cuenta propia si se quiere desplegar en llama.cpp u Ollama.
- Cero validacion comunitaria: 0 descargas y 0 likes implican que el checkpoint no ha sido reproducido ni auditado por terceros.
- Discrepancia con fuentes de terceros: un agregador externo (hfviewer) describe este identificador como un modelo multimodal de la familia Qwen3.5 procedente de otro proyecto, lo que contradice el nombre, las etiquetas y el numero de parametros del repositorio. Esa descripcion es inconsistente con los datos de HuggingFace y no debe tomarse como fiable.
- Sesgos: no documentados, pero un modelo pequeno entrenado con un dataset no publicado hereda los sesgos de ese dataset y del preentrenamiento original, sin que existan filtros declarados.
- Caducidad del linaje: al depender de checkpoints intermedios de un tercero, la reproducibilidad a largo plazo no esta garantizada si esos repositorios se modifican o se eliminan.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Panga-Azazia/LFM2.5-350M-TTS-v3
- Modelo base directo: https://huggingface.co/Panga-Azazia/LFM2.5-350M-TTS
- Repositorio hermano con variante "Spe": https://huggingface.co/Panga-Azazia/LFM2.5-350M-TTS-Spe
- Repositorio hermano con adaptadores LoRA: https://huggingface.co/Panga-Azazia/LFM2.5-350M-LORA-TTS
- Ficha de terceros con informacion contradictoria: https://hfviewer.com/Panga-Azazia/LFM2.5-350M-TTS
- Blog de Liquid AI sobre LFM2.5-350M: https://www.liquid.ai/blog/lfm2-5-350m-no-size-left-behind
- Informe tecnico de LFM2 (arXiv): https://arxiv.org/html/2511.23404v1
