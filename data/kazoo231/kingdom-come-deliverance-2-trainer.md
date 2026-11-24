# kazoo231/kingdom-come-deliverance-2-trainer

## Resumen

No se trata de un modelo de inteligencia artificial. El repositorio `kazoo231/kingdom-come-deliverance-2-trainer` alojado en Hugging Face no contiene pesos, arquitectura ni artefactos de un modelo de lenguaje: segun la informacion disponible, es la publicacion de un supuesto "trainer" (herramienta de trampas) para el videojuego Kingdom Come Deliverance 2, empaquetado como un ejecutable de Windows de 4,8 MB distribuido mediante un archivo ZIP protegido con contrasena.

La model card no describe ninguna arquitectura transformer, MoE ni SSM, no incluye datos de entrenamiento, no declara parametros, contexto ni cuantizaciones, y no proporciona ningun benchmark. Los unicos metadatos tecnicos son etiquetas de plataforma (`windows`, `windows-11`, `x64`, `portable`) y una lista de catorce idiomas que, en la practica, corresponde a los idiomas declarados para la herramienta, no a capacidades linguisticas de un modelo.

Por tanto, esta ficha se limita a documentar lo que el repositorio declara y a senalar los riesgos evidentes de seguridad asociados a la distribucion de binarios ejecutables con contrasena de descompresion, enlaces a repositorios de terceros y afirmaciones no verificables (870K descargas, 99 % de valoraciones verificadas). No debe evaluarse como un modelo open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados para la herramienta) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un ZIP con un `.exe` de Windows) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento documentado. El artefacto descrito es un ejecutable `lossless-scaling-3-dlss4-unlocked-2026-v1.2.2-win64.exe` (build `v2.7.1`, identificador `DEA152807F`) empaquetado en un ZIP de 4,8 MB. La model card menciona caracteristicas propias de una herramienta de trampas para videojuegos: perfiles JSON intercambiables en caliente, suavizado de entrada bezier, tecla de panico (`END`), capa de render "stream-proof" para excluir capturas de OBS, ShadowPlay y Discord, overlay externo a 144 Hz con cajas delimitadoras y esqueletos de huesos, y un escaner dinamico de offsets de memoria.

Ninguno de estos elementos constituye un modelo de aprendizaje automatico. No se declara dataset, numero de tokens, RLHF, DPO ni innovacion algorítmica alguna. Los nombres de los archivos (`lossless-scaling-3-dlss4-unlocked-2026`) parecen imitar nombres de tecnologias reales (Lossless Scaling, DLSS 4) sin relacion verificable con ellas.

## Capacidades

- No se declaran capacidades de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad multilingue real; la lista de idiomas son etiquetas de metadatos.
- La model card atribuye a la herramienta funciones de modificacion de memoria de un juego de PC (perfiles de trampas, overlay, escaneo de offsets), no capacidades de IA.

## Casos de uso

- No procede. Al no ser un modelo de IA, no existen casos de uso legitimos de inferencia, generacion o analisis.
- Auditoria de seguridad: el repositorio puede usarse como caso de estudio de campanas de distribucion de binarios sospechosos en plataformas de modelos, con contrasena de descompresion para evadir analisis automatizado.
- Formacion en higiene de cadena de suministro: ilustra por que conviene verificar la procedencia de ejecutables antes de descargarlos.
- Monitorizacion de repositorios: util para equipos que rastrean publicaciones anomalas etiquetadas como modelos en Hugging Face.
- Analisis de ingenieria social: la model card emplea insignias de descargas y valoraciones no verificables para generar confianza.
- No se recomienda su ejecucion en entornos de produccion, personales ni corporativos bajo ninguna circunstancia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica inferencia de modelos; no requiere VRAM ni GPU.
- El artefacto declara compatibilidad con Windows 10 y Windows 11 de 64 bits.
- La model card afirma un uso de memoria inferior a 22 MB en RAM para la capa de render y un sondeo a 431 Hz con diez hilos de trabajo; estos datos no son verificables.
- Opciones de despliegue: no disponibles. No hay soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existe categoria de modelos comparable, ya que el repositorio no contiene un modelo de IA. Frente a modelos open source reales (por ejemplo, familias tipo Llama, Mistral o Qwen), la comparacion carece de sentido: no hay parametros, contexto, licencia de pesos ni artefactos de inferencia que contrastar.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no procesa lenguaje natural.
- Riesgo elevado de seguridad: se distribuye un ejecutable de Windows protegido con contrasena (`2026`), practica habitual para dificultar el analisis por parte de antivirus y sandboxes.
- Los enlaces de descarga apuntan a repositorios de GitHub de terceros (`Hiroshis198`, `HanaRuiz49196`) distintos del titular del repositorio en Hugging Face, lo que rompe la trazabilidad.
- Las cifras de descargas (870K+) y valoraciones (99 % verificadas) son afirmaciones de la model card sin respaldo en los metadatos de Hugging Face, que registran 0 descargas y 0 likes.
- La licencia MIT declarada no aporta garantias sobre el binario distribuido ni sobre su procedencia.
- El uso de herramientas de trampas en videojuegos puede violar los terminos de servicio del juego y conllevar el baneo de cuentas.
- No debe ejecutarse en ninguna maquina, y menos con privilegios de administrador como sugiere la propia model card.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kazoo231/kingdom-come-deliverance-2-trainer
- Enlace de descarga citado en la model card (no verificado, no recomendado): https://github.com/Hiroshis198/lossless-scaling-3-dlss4-unlocked-2026/releases/download/v1.2.0/lossless-scaling-3-dlss4-unlocked-2026-v1.2.2-win64.zip
- Repositorio de GitHub citado en la model card (no verificado): https://github.com/HanaRuiz49196/kingdom-come-deliverance-2-trainer/releases/latest
