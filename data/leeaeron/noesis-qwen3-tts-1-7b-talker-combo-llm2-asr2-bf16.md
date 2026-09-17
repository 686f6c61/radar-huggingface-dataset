# LeeAeron/NOESIS-Qwen3-TTS-1.7B-Talker-Combo-LLM2-ASR2-BF16

## Resumen

NOESIS-Qwen3-TTS-1.7B-Talker-Combo-LLM2-ASR2-BF16 es un paquete de pesos y adaptadores LoRA de sintesis de voz (text-to-speech) publicado por el usuario LeeAeron dentro del ecosistema NOESIS / AMAImedia, un framework de doblaje multilingue automatizado denominado DHCF-FNO. No se trata de un modelo entrenado desde cero, sino de una mezcla cross-modal de 1.928.677.440 parametros (aproximadamente 1,93 mil millones) que combina el backbone Talker de Qwen3-TTS-1.7B con un injerto de red feed-forward procedente de las ramas de lenguaje (Qwen3-1.7B) y de reconocimiento de voz (Qwen3-ASR-1.7B), todo ello sobre la base de la variante Darwin-TTS-1.7B-Cross.

El modelo resuelve un problema muy concreto: servir como ruta especialista y de respaldo dentro de un enrutador de voces multilingue (Voice Router-Swap) que necesita cubrir 112 idiomas sin fusionar todos los adaptadores en un unico checkpoint. La estrategia del autor consiste en mantener un adaptador LoRA por familia linguistica y conmutarlo en funcion del idioma de cada segmento de audio, en lugar de consolidar todos los adaptadores, una decision sellada bajo la regla interna R-TALKER-112LANG-PER-FAMILY-SWAP-NOT-MERGE-2026-06-11.

Es relevante ahora porque aborda dos necesidades practicas del sector: clonacion de voz zero-shot multilingue y despliegue con huella de memoria reducida (los pesos en BF16 ocupan unos 3,86 GB teoricos), lo que permite ejecutarlo en GPU de consumo. Su publicacion es muy reciente (17 de septiembre de 2026, segun los metadatos de HuggingFace) y no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla cross-modal sobre backbone Talker de Qwen3-TTS-1.7B, con injerto FFN de las ramas Qwen3-1.7B (LLM) y Qwen3-ASR-1.7B; el autor no detalla el numero de capas ni la configuracion interna |
| Parametros totales | 1.928.677.440 (aproximadamente 1,93 B), segun los safetensors del repositorio |
| Parametros activos | no aplica (el bundle no es un modelo MoE, aunque el bundle padre si lo sea) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 en safetensors; no se publican quants GGUF ni otras precisiones en este repositorio |
| Idiomas soportados | 112 idiomas, entre ellos es, en, de, fr, it, pt, zh, ja, ko, ar, hi, ru, vi, tr, nl, pl, sv, yue y zu, segun la lista de la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 5,3 GB |
| Adaptadores incluidos | LoRA por familia linguistica, rango r=8 con escala 0,32 en la ruta principal; variantes r=16 para las familias `indic` e `iranian` |
| Modelos base | Qwen/Qwen3-TTS-12Hz-1.7B-Base, Qwen/Qwen3-1.7B, Qwen/Qwen3-ASR-1.7B, FINAL-Bench/Darwin-TTS-1.7B-Cross |
| Pipeline declarado | text-to-speech |
| Bundle padre | NOESIS-3.5B-A0.5B-DUBBING-FILM/NOESIS-Qwen3-Omni-MoE-BF16 |

## Arquitectura y entrenamiento

La model card describe una linea evolutiva en dos etapas. Primero, las ramas de habla y texto de 1,7 B se combinaron en la mezcla Darwin, dando lugar a la ruta Talker. Despues, esa ruta se amplio con entrenamiento propio de NOESIS y con adaptadores por familia linguistica. Los cuatro componentes declarados son el backbone generador de habla Qwen3-TTS Talker 1.7B, el andamiaje base Qwen3-TTS-12Hz-1.7B-Base, la rama de modelado de lenguaje Qwen3-1.7B y la rama de comprension de habla / ASR Qwen3-ASR-1.7B. El resultado es una mezcla cross-modal de 1,7 B, no un transformer denso convencional ni un modelo de espacio de estados.

En cuanto al entrenamiento, el autor indica que los adaptadores se entrenaron con FLEURS y Common Voice 25.0, con LoRA por familia y una pasada posterior de GRPO/DPO. La ruta principal usa LoRA de rango r=8 con escala 0,32, y existen variantes de rango r=16 para las familias indic e iraní. La innovacion operativa destacable no es arquitectonica sino de despliegue: el enrutador selecciona una familia linguistica, aplica un unico adaptador a la escala prescrita, sintetiza el segmento y solo conmuta el adaptador o el modelo cuando cambia el idioma destino, evitando la fusion destructiva de todos los adaptadores en un unico checkpoint. El autor no publica el numero total de tokens de entrenamiento, la composicion exacta del dataset ni los hiperparametros del post-entrenamiento; esa informacion no esta disponible.

## Capacidades

- Sintesis de voz multilingue con cobertura declarada de 112 idiomas.
- Clonacion de voz zero-shot, es decir, imitacion de timbre a partir de audio de referencia sin reentrenamiento.
- Enrutado por familia linguistica mediante adaptadores LoRA conmutables en lugar de un unico adaptador fusionado.
- Rama de comprension de habla integrada (procedente de Qwen3-ASR-1.7B), lo que aporta capacidad de procesamiento de audio de entrada dentro de la mezcla.
- Rama de modelado de lenguaje (procedente de Qwen3-1.7B) integrada en el injerto cross-modal.
- Orientacion a produccion de doblaje: el bundle esta pensado para ser cargado por el enrutador NOESIS y su worker TTS residente, sintetizando por segmentos.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision o modo thinking: no disponible (no se declara ninguna de estas capacidades en la informacion proporcionada, y el pipeline es text-to-speech).

## Casos de uso

- Doblaje automatizado de contenido audiovisual: el modelo genera la pista de voz en el idioma destino manteniendo el timbre del hablante original mediante clonacion zero-shot, y el enrutador conmuta al adaptador de la familia linguistica correspondiente cuando cambia el idioma del segmento.
- Localizacion multilingue de catalogos de video bajo demanda: con 112 idiomas declarados, una plataforma puede producir versiones dobladas de un mismo material sin mantener un modelo separado por idioma, aplicando el adaptador adecuado por titulo o por region.
- Audiolibros y narracion sintetica: la clonacion zero-shot permite mantener una voz consistente a lo largo de horas de audio y replicar la voz del narrador original autorizado.
- Asistentes de voz con identidad de marca: una empresa puede fijar una voz corporativa y generar respuestas habladas en los idiomas de sus mercados usando los adaptadores por familia.
- Accesibilidad y lectura de contenido: conversion de textos largos a audio en el idioma del usuario, con la ventaja de que el modelo cabe en hardware de gama media, lo que abarata el despliegue en entornos educativos o institucionales.
- Prototipado rapido de productos de voz en investigacion: al ser un paquete BF16 de 1,93 B que se ejecuta en GPU de consumo, resulta util para experimentar con enrutado de adaptadores LoRA y estrategias de conmutacion por idioma sin acceso a clústeres grandes.
- Post-produccion de podcast y contenido corporativo: regeneracion de fragmentos de audio cuando cambia el guion, conservando la voz y el idioma del resto de la grabacion.
- Investigacion sobre mezcla cross-modal: el injerto de ramas LLM y ASR sobre un backbone TTS sirve como caso de estudio para medir como afecta la adicion de capacidad textual y de comprension de audio a un generador de habla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de WER, MOS, similitud de hablante ni metricas comparativas, y los resultados de la busqueda web realizada no contienen informacion sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 suman aproximadamente 3,86 GB (1.928.677.440 parametros x 2 bytes). Sumando activaciones, cache y los adaptadores LoRA, un presupuesto practico de 5 a 6 GB de VRAM es razonable para inferencia en BF16. Cifra estimada a partir del recuento de parametros; el autor no publica mediciones de memoria.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM. El propio autor indica que su equipo local es una RTX 3060 Laptop de 6 GB GDDR6, lo que confirma la viabilidad en esa clase de hardware. GPU profesionales como A100 o H100 funcionan sobradamente, aunque estan muy por encima de lo necesario.
- Cabe en GPU de consumo: si. La RTX 3060 de 6 GB es el caso documentado por el autor; tarjetas como RTX 4060, RTX 4070 o superiores sin dificultad.
- Opciones de despliegue: el bundle esta disenado para ser cargado por el enrutador NOESIS y su worker TTS residente de Qwen. No es una aplicacion autonoma con interfaz grafica. No se declara soporte para vLLM, llama.cpp, Ollama ni TGI, y al no publicarse quants GGUF la via de llama.cpp u Ollama no esta disponible en este repositorio.
- Latencia y throughput estimados: no disponible. El autor no publica mediciones de RTF, latencia por segmento ni tokens de audio por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NOESIS-Qwen3-TTS-1.7B-Talker-Combo-LLM2-ASR2-BF16 | 1,93 B | no disponible | 112 declarados | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3-TTS-12Hz-1.7B-Base | no disponible en la informacion proporcionada | no disponible | no disponible | Apache 2.0 (indicada como licencia del upstream en la model card) | HuggingFace, modelo publico de Qwen Team / Alibaba |
| FINAL-Bench/Darwin-TTS-1.7B-Cross | no disponible | no disponible | no disponible | no disponible | HuggingFace, referenciado como base del fine-tune |
| Qwen/Qwen3-1.7B | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| Qwen/Qwen3-ASR-1.7B | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace |

No se dispone de datos de rendimiento comparado entre estas alternativas, por lo que la comparativa se limita a parametros, licencia y disponibilidad. La busqueda web realizada no aporto informacion adicional sobre modelos comparables de sintesis de voz.

## Limitaciones y advertencias

- El bundle no es una aplicacion autonoma: requiere el enrutador padre NOESIS y un worker TTS de Qwen para funcionar. Cargarlo de forma aislada puede no reproducir el comportamiento previsto.
- La seleccion de adaptador debe hacerse por familia linguistica a la escala prescrita (0,32 para r=8). La regla sellada del autor prohihe expresamente fusionar todos los adaptadores en un unico checkpoint, ya que se considera una operacion destructiva.
- Riesgo de alucinacion acustica: como todo modelo generativo de habla, puede producir prosodia incorrecta, artefactos, ruido o pronunciaciones erroneas, especialmente en idiomas con pocos datos de adaptacion.
- Sesgos de hablante: los adaptadores se entrenaron con FLEURS y Common Voice 25.0, corpus con distribucion desigual por idioma, acento y genero. La calidad de clonacion y de pronunciacion variara de forma notable entre lenguas mayoritarias y minoritarias.
- Calidad desigual por idioma: la lista de 112 idiomas no implica un rendimiento homogeneo. Es razonable esperar una cobertura solida en lenguas con muchos datos y resultados fragiles en las de bajos recursos.
- Uso responsable de la clonacion de voz: la capacidad de clonacion zero-shot exige consentimiento explicito del hablante y cumplimiento de la normativa de derechos de imagen y voz aplicable en cada jurisdiccion.
- Restricciones de licencia: la licencia declarada es Apache 2.0, lo que permite uso comercial, pero la procedencia de los pesos derivados (mezcla Darwin y adaptadores NOESIS) no esta documentada en detalle en la informacion disponible. Conviene verificar la cadena de licencias de todos los modelos base antes de un despliegue comercial.
- Madurez limitada: el repositorio registra 0 descargas y 0 likes en el momento de redactar la ficha, con una antiguedad de publicacion muy corta. No existen informes de terceros, evaluaciones independientes ni casos de produccion verificables.
- Documentacion incompleta: la model card disponible esta truncada y no incluye contexto, datos de entrenamiento completos, hiperparametros ni instrucciones de inferencia reproducibles.
- Ausencia de cuantizaciones publicadas: al no haber GGUF ni otras precisiones, el despliegue en CPU o en hardware muy limitado no esta cubierto por este repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LeeAeron/NOESIS-Qwen3-TTS-1.7B-Talker-Combo-LLM2-ASR2-BF16
- Qwen3-TTS (repositorio oficial de la familia): https://github.com/QwenLM/Qwen3-TTS
- Qwen/Qwen3-TTS-12Hz-1.7B-Base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Qwen/Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Qwen/Qwen3-ASR-1.7B: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- FINAL-Bench/Darwin-TTS-1.7B-Cross: https://huggingface.co/FINAL-Bench/Darwin-TTS-1.7B-Cross
- Sitio del mantenedor (AMAImedia): https://www.amaimedia.com
- Perfil en X del mantenedor: https://x.com/AMAImediacom
- LinkedIn del mantenedor: https://www.linkedin.com/in/ilia-bolotnikov
- Telegram del mantenedor: https://t.me/AMAImediacom
