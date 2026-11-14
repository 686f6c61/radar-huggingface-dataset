# Mawdistical-S1/Synica-27B-GGUF

## Resumen

Synica 27B es un ajuste fino (finetune) de tipo conversacional y roleplay, desarrollado por Mawdistical (Mawdistical-S1), construido sobre el modelo base Qwen/Qwen3.8-27B. Se distribuye exclusivamente en formato GGUF cuantizado y esta orientado a generacion de texto para roleplay explicito, tematicas NSFW, contenido furry/anthro y simulacion de personajes. El repositorio declara 27.320.697.856 parametros totales y un tamano de 360 GB, lo que refleja el conjunto de multiples cuantizaciones GGUF mas que un unico fichero de pesos.

El modelo no introduce arquitectura propia: hereda la de su base Qwen3.8-27B (transformer denso, sin datos publicos de contexto en la informacion disponible) y anade un ajuste fino con un dataset privado de roleplay compuesto por mas de 600 "rotation sets" de 20+ mensajes cada uno, con tematicas de violencia, temas oscuros, NSFW intenso, world building y secuencias multipersonaje. La model card indica un enfoque "male leaning" y dinamicas experimentales.

Su relevancia es acotada y muy de nicho: no es un modelo para tareas de produccion general, codigo o razonamiento, sino una pieza especializada para comunidades de roleplay. La licencia es "other" (no estandar), el idioma declarado es unicamente ingles, y el autor marca explicitamente el modelo como no apto para todas las audiencias. No hay descargas ni likes registrados en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.8-27B); detalles internos no disponibles |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No aplica (no se declara MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (multiples cuantizaciones en el repo; niveles concretos no disponibles) |
| Idiomas soportados | Ingles (en) |
| Licencia | other (no estandar; terminos no detallados) |
| Formato de pesos | GGUF (repo de 360 GB con varias cuantizaciones); libreria declarada: transformers |

## Arquitectura y entrenamiento

El modelo es un finetune del base Qwen/Qwen3.8-27B, por lo que su arquitectura subyacente es la del transformer denso de Qwen, sin que la informacion disponible detalle capas, dimensiones ocultas, atencion (MHA/GQA) ni mecanismos adicionales. No se documenta si el ajuste se realizo mediante SFT, LoRA fusionado, DPO o RLHF; la model card solo describe la composicion del dataset de ajuste.

El dataset de finetune es privado ("Private In-House") y consta de mas de 600 rotation sets con mas de 20 mensajes cada uno. La composicion declarada incluye encuentros violentos, temas oscuros, NSFW intenso (activado por accion del usuario o de forma pasiva en contextos de roleplay), acciones de world building, secuencias multipersonaje y caracter a caracter, simulacion y guias de roleplay, y "kink shifting". La creacion de datos es hibrida: dialogos de roleplay sinteticos combinados con dialogos extraidos internamente de instancias, con intervencion humana en parte de las secuencias multipersonaje para control de calidad. No se indica numero de tokens de entrenamiento ni si hubo etapas de alineamiento adicionales.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a roleplay multi-turno con personajes definidos.
- Roleplay explicito y NSFW, incluyendo temas oscuros, violencia y contenido adulto.
- Simulacion de personajes furry/anthro y dinamicas multipersonaje (intercambios caracter a caracter).
- World building y conduccion narrativa dentro de la conversacion.
- Soporte de formato de chat ChatML.
- Ajuste recomendado de muestreo por el autor: temperatura 0.8 y min_p 0.05.
- Requiere prefill y descripciones de personaje explicitas para un comportamiento guiado.
- Tool calling / function calling: no disponible (no declarado).
- Capacidades de agente, razonamiento multi-paso, vision o audio: no disponibles (no declaradas).
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Roleplay conversacional de nicho: el modelo esta ajustado especificamente para mantener personajes coherentes en conversaciones largas de roleplay, con mas de 600 sets de entrenamiento orientados a este fin; adecuado para plataformas de chat de personajes.
- Simulacion de personajes furry/anthro: el ajuste incluye contenido de este dominio, por lo que es apropiado para comunidades que buscan este tipo de interaccion con consistencia tematica.
- Narrativa interactiva multipersonaje: entrenado con secuencias caracter a caracter y acciones de world building, puede gestionar escenas con varios personajes y cambios de escena dentro de un mismo hilo.
- Prototipado de experiencias de rol adulto: util para desarrolladores que construyen productos de entretenimiento para adultos y necesitan un modelo local que no dependa de APIs externas con filtros.
- Investigacion sobre dinamicas de roleplay y sesgos: su dataset documentado (violencia, temas oscuros, kink shifting) lo hace util para estudiar como el ajuste fino moldea el comportamiento conversacional en dominios sensibles.
- Despliegue local en ingles para usuarios avanzados: al distribuirse en GGUF, puede ejecutarse con llama.cpp u Ollama en hardware de consumo, lo que permite uso privado sin enviar datos a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo denso de ~27B en GGUF, las cuantizaciones de 4 bits suelen requerir del orden de 16-18 GB y las de 8 bits del orden de 28-30 GB, aunque el repo no detalla los niveles incluidos.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cabria esperar uso en A100/H100 para cuantizaciones altas y en RTX 4090 (24 GB) para cuantizaciones de 4 bits.
- Cabe en GPU de consumo: probable en RTX 3090/4090 con cuantizaciones de 4 bits, sujeto a los niveles GGUF realmente publicados (no confirmado).
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; la libreria declarada es transformers, aunque el formato GGUF es el principal artefacto distribuido.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Synica 27B | 27,3B | No disponible | Roleplay NSFW/furry, ingles | other | GGUF en HF |
| Qwen/Qwen3.8-27B (base) | ~27B | No disponible | Proposito general | Segun Qwen | HF |
| Alternativas de roleplay de ~27B | No disponible | No disponible | Roleplay | Variable | Variable |

No se dispone de datos de rendimiento comparativo ni de modelos de referencia equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido explicito y NSFW: el modelo esta disenado para generar material adulto, violencia y temas oscuros; no es apto para uso general ni para entornos no moderados.
- Riesgo de alucinacion: como todo modelo generativo de roleplay, puede inventar hechos y mantener narrativas incoherentes fuera de su dominio de ajuste.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado.
- Licencia "other": los terminos no estan detallados en la informacion disponible, por lo que el uso comercial requiere revisar la licencia del modelo base Qwen y la del autor antes de cualquier despliegue.
- Dependencia del base: hereda los sesgos y limitaciones de Qwen3.8-27B, ademas de los sesgos introducidos por el dataset de roleplay (enfoque "male leaning", dinamicas experimentales).
- Requiere prefill y descripciones de personaje explicitas; sin ellas el comportamiento puede degradarse.
- Sin benchmarks publicados ni descargas registradas: madurez y calidad no verificadas de forma independiente.
- El repo de 360 GB implica un coste de almacenamiento considerable si se descargan todas las cuantizaciones.

## Enlaces

- Hugging Face: https://huggingface.co/Mawdistical-S1/Synica-27B-GGUF
- Coleccion Synica: https://huggingface.co/collections/Mawdistical/synica
- Discord del autor: https://discord.gg/aU3a5phBQD
- Apoyo al autor (Ko-fi): https://ko-fi.com/mawnipulator
- Perfil del autor: https://vyvan.se
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
