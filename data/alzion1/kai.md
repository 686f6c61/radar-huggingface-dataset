# alzion1/kai

## Resumen

Kai es un ajuste fino mediante LoRA del modelo Gemma 4 E2B (variante instruction-tuned y cuantizada a 4 bits) desarrollado por Aisulu Tustykbayeva y Ramilya Tustykbayeva dentro del proyecto "Safe AI Tutor for Kids". El objetivo es construir un tutor conversacional para ninos de 3 a 8 anos que funcione completamente offline en tablets Android de bajo coste (entorno de 4 GB de RAM y unos 100 dolares), de modo que ningun dato infantil abandone el dispositivo. El modelo se distribuye unicamente como GGUF cuantizado en Q4_K_M (unos 3,4 GB), pensado para ejecutarse con llama.cpp, Ollama o LM Studio.

El modelo no busca responder directamente, sino aplicar andamiaje socratico: formular preguntas guiadas que mantengan al nino creando activamente en lugar de consumir pasivamente. Tambien esta entrenado para redirigir juego inseguro hacia alternativas creativas, rechazar temas fuera de alcance, corregir estereotipos y adaptar el vocabulario por franjas de edad (3-5 y 6-8 anos). Es un prototipo de investigacion presentado como candidatura al Stanford Accelerator for Learning, no un producto validado para uso infantil sin supervision.

La relevancia actual reside en su enfoque de sistema compuesto ("harness-first"): el modelo es solo un componente dentro de un sistema con reglas de seguridad deterministas en codigo, depuracion de PII antes de la inferencia (basada en Microsoft Presidio), verificacion de salida y retencion cero por diseno, alineado con COPPA y el Reglamento europeo de IA. El ajuste se realizo sobre 505 ejemplos de instruccion escritos especificamente para el proyecto, sin datos infantiles reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Gemma 4 E2B instruction-tuned); adaptacion LoRA sobre proyecciones lineales |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unica publicada) |
| Idiomas soportados | Ingles (en) |
| Licencia | no disponible (se aplican los terminos de Google Gemma al ser un derivado) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/gemma-4-e2b-it-unsloth-bnb-4bit`, una version instruction-tuned de Gemma 4 E2B cuantizada a 4 bits con Unsloth. Sobre esa base se aplico un adaptador LoRA de rango 16 y alpha 16, sin dropout, dirigido a todas las proyecciones lineales (q, k, v, o, gate, up y down). El entrenamiento fue un ajuste supervisado (SFT) realizado con Unsloth, TRL, PEFT 0.19.1 y Transformers. Los pesos resultantes se fusionaron con la base y se exportaron a GGUF con cuantizacion Q4_K_M para inferencia en dispositivo.

El conjunto de datos de entrenamiento es propio y de tamano reducido: 505 ejemplos con estructura `instruction` / `input` / `output` y metadatos de franja de edad y categoria. No contiene datos infantiles ni conversaciones extraidas de la web. La distribucion por categorias incluye 108 ejemplos de andamiaje matematico, 108 de juego, 52 de redireccion de juego inseguro ("Pivot to Play"), 37 de lectura y fonetica, 28 de anti-sesgo y correccion de estereotipos, 20 de inclusion de discapacidad, 20 de metacognicion y mentalidad de crecimiento, 16 socioemocionales y de duelo, 16 de aspiraciones profesionales, 12 de rechazos de seguridad y 8 de privacidad de datos, entre otros. No se documenta innovacion arquitectonica adicional mas alla del ajuste LoRA; el valor diferencial esta en el diseno del dataset y en el sistema de seguridad que rodea al modelo.

## Capacidades

- Generacion de texto conversacional en ingles orientada a tutoria infantil.
- Andamiaje socratico: respuestas en forma de preguntas guiadas que fomentan la autoria activa del nino.
- Redireccion de seguridad: transforma propuestas de juego violento, contenido adulto o actos peligrosos en alternativas creativas seguras.
- Rechazo y derivacion: declina temas fuera de alcance y los redirige a los padres.
- Correccion de sesgos: valida preguntas de identidad (raza, genero, clase, discapacidad) y corrige estereotipos con lenguaje adaptado a la edad.
- Adaptacion por franja de edad: vocabulario y estilo distintos para 3-5 y 6-8 anos.
- Apoyo en matematicas, lectura y fonetica, habilidades socioemocionales y mentalidad de crecimiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada.
- Capacidades multilingues: solo ingles.
- Capacidades especiales: no se declaran modos de pensamiento, vision ni audio.

## Casos de uso

- Tutoria de matematicas tempranas en tablet offline: el modelo plantea preguntas de andamiaje en lugar de dar la solucion, lo que encaja con el objetivo de que el nino construya el razonamiento; se ejecuta en local con llama.cpp sin conexion.
- Redireccion de juego inseguro en el aula: ante una peticion de juego violento, el modelo propone una alternativa creativa segura, apoyandose en los 52 ejemplos de "Pivot to Play" del entrenamiento.
- Acompanamiento de lectura y fonetica: guia ejercicios de decodificacion y sonidos con vocabulario adaptado a la franja 3-5 o 6-8, adecuado para tablets de bajo coste en entornos con conectividad limitada.
- Educacion socioemocional y duelo: ofrece respuestas de validacion emocional y mentalidad de crecimiento en conversaciones cortas, dentro de un sistema con supervision adulta.
- Correccion de estereotipos en conversaciones infantiles: responde a preguntas sobre identidad, genero o discapacidad con lenguaje apropiado para la edad, usando los 28 ejemplos de anti-sesgo y los 20 de inclusion.
- Prototipo de investigacion para sistemas de IA infantil segura: sirve como componente de un pipeline con depuracion de PII (Presidio), reglas deterministas y verificacion de salida, util para estudiar arquitecturas "harness-first" en cumplimiento de COPPA y del Reglamento europeo de IA.
- Demostracion de ajuste LoRA eficiente en dispositivo: ejemplo reproducible de SFT con Unsloth sobre una base de 4,6 mil millones de parametros y exportacion a GGUF Q4_K_M para hardware de gama baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que aun no hay evaluacion formal: existe un protocolo definido (conjunto dorado de interacciones verificadas, objetivo del 100 % en casos de rechazo, calidad socratica y fundamentacion factica) cuyos resultados se anadiran cuando finalicen las ejecuciones.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q4_K_M ocupa aproximadamente 3,4 GB; se necesita espacio adicional para el contexto y el runtime, por lo que conviene disponer de 4 GB o mas de memoria unificada o VRAM.
- GPU recomendadas: no se especifican; el diseno apunta a ejecucion en CPU en tablets Android de gama baja con 4 GB de RAM.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas de VRAM (por ejemplo, RTX 3060 en adelante) mediante llama.cpp con offload parcial o total; en GPUs con menos memoria puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama, LM Studio y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Kai (alzion1/kai) | 4.647.450.147 | no disponible | en | no disponible (terminos Gemma) | GGUF Q4_K_M | LoRA SFT sobre Gemma 4 E2B; 505 ejemplos; sin benchmarks publicados |
| alzion1/pip | 5B | no disponible | no disponible | no disponible | no disponible | Iteracion anterior del mismo autor sobre Gemma 3 1B-IT, segun la model card |
| Gemma 4 E2B (base, Google) | no disponible | no disponible | no disponible | terminos Google Gemma | safetensors / GGUF (segun distribucion) | Modelo base instruction-tuned sin el ajuste de tutoria infantil |

## Limitaciones y advertencias

- Prototipo de investigacion: no es un producto de produccion ni sustituye la supervision de un adulto; no debe desplegarse para uso no supervisado por parte de ninos.
- El ajuste fino reduce, pero no elimina, el riesgo de salidas inapropiadas o incorrectas; el sistema de seguridad circundante forma parte del diseno y es imprescindible.
- Entrenado con un conjunto pequeno y solo en ingles (505 ejemplos); el comportamiento fuera de las categorias y franjas de edad cubiertas no esta caracterizado.
- Riesgo de alucinacion no evaluado formalmente; no hay resultados de benchmarks ni de evaluacion de seguridad publicados.
- Sesgos conocidos: no documentados de forma explicita; el dataset incluye ejemplos de correccion de sesgos, pero no se reporta una evaluacion sistematica.
- Restricciones de licencia: la licencia del repositorio figura como no disponible; al ser un derivado de Gemma, se aplican los terminos de Google Gemma, que deben revisarse antes de cualquier uso comercial.
- Limitaciones de contexto e idioma: solo ingles y longitud de contexto no especificada; el uso en castellano no esta soportado ni evaluado.
- Trazabilidad del artefacto: el comando de ejemplo de la model card referencia un archivo `pip-tutor-q4_k_m.gguf`, lo que sugiere reutilizacion de artefactos de la iteracion anterior; conviene verificar el contenido real del repositorio antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alzion1/kai
- Perfil del autor: https://huggingface.co/alzion1
- Iteracion anterior (pip): https://huggingface.co/alzion1/pip
- Sitio del proyecto: https://alzion.github.io
