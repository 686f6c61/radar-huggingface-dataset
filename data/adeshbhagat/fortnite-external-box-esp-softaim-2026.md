# adeshbhagat/fortnite-external-box-esp-softaim-2026

## Resumen

La ficha corresponde al repositorio de Hugging Face `adeshbhagat/fortnite-external-box-esp-softaim-2026`, publicado el 24 de noviembre de 2026. A pesar de estar alojado en una plataforma de modelos de IA, el contenido no describe un modelo de aprendizaje automatico: la model card se presenta como la distribucion de un supuesto ejecutable para Windows de 64 bits (`fisch-script-auto-catch-macro-v1.2.2-win64.exe`, comprimido en un ZIP de 4,8 MB) que se promociona como herramienta externa de ESP (deteccion de jugadores) y softaim para el videojuego Fortnite.

No existe informacion sobre arquitectura de red neuronal, parametros, tokenizador, datos de entrenamiento ni pesos en formato safetensors o GGUF. Los metadatos de Hugging Face (tags `windows`, `windows-11`, `x64`, `portable`) y el contenido del README apuntan a un binario empaquetado con contrasena (`2026`) y distribuido mediante enlaces a un repositorio de GitHub de terceros, no a un artefacto de inferencia.

Desde el punto de vista de la evaluacion tecnica, el repositorio carece de cualquier elemento verificable como modelo de IA: no hay pipeline declarado, no hay tarjetas de evaluacion, no hay benchmarks y las descargas y likes son cero. Se trata, por tanto, de un artefacto ajeno a la categoria de modelos open source y debe tratarse como contenido no fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se describe como ejecutable externo para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de Windows, no pesos de modelo) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre arquitectura de red neuronal, capas, atencion, mezcla de expertos ni estrategia de entrenamiento. El README describe modulos funcionales de un supuesto programa de escritorio (escaneo de offsets, suavizado de entrada tipo Bezier, overlay externo a 144 Hz, capa de render incompatible con captura de pantalla, perfiles JSON intercambiables en caliente y tecla de panico `END`), pero no documenta ningun proceso de entrenamiento, dataset, RLHF, DPO ni tecnica de optimizacion de inferencia.

Tampoco se especifican tokens de entrenamiento, composicion del corpus ni innovaciones tecnicas propias de modelos generativos (decodificacion especulativa, atencion lineal, SSM, etc.). La unica informacion tecnica concreta son cifras de rendimiento del supuesto ejecutable (menos de 54 MB de RAM, sondeo a 218 Hz, respuesta inferior a 13 ms, cuatro hilos de trabajo), que no son verificables ni corresponden a metricas de un modelo de lenguaje.

## Capacidades

- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue real; los idiomas listados en los metadatos corresponden a la ficha del repositorio, no a un modelo entrenado.
- El README atribuye al binario funciones de ESP (cajas 2D/3D, esqueletos de huesos, distancia), softaim con suavizado Bezier, overlay externo y evasion de captura de pantalla. Estas funciones no son capacidades de un modelo de IA y no se han verificado.

## Casos de uso

- No procede: el repositorio no contiene un modelo de IA y no se identifican aplicaciones legitimas de inferencia.
- No procede: no hay pesos, tokenizador ni API de inferencia que permitan integrar el artefacto en un pipeline de generacion de texto.
- No procede: no existe documentacion de despliegue en servidores, contenedores ni plataformas de serving.
- No procede: no hay evidencia de uso en atencion al cliente, generacion de codigo, analisis documental ni tareas de razonamiento.
- No procede: el contenido descrito (ESP y softaim para un videojuego) se asocia a trampas en juegos multijugador, con el riesgo de sanciones por parte del editor y de la plataforma.
- No procede: la distribucion mediante un ZIP con contrasena y un ejecutable que solicita permisos de administrador constituye un patron habitual de malware, no un caso de uso valido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no hay pesos de modelo que cargar.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles; el artefacto es un ejecutable de Windows x64, no un modelo servible.
- Latencia y throughput: el README cita cifras del supuesto ejecutable (sondeo a 218 Hz, respuesta inferior a 13 ms, menos de 54 MB de RAM, cuatro hilos), no verificables y sin relacion con inferencia de IA.
- Sistema operativo declarado: Windows y Windows 11, arquitectura x64, distribucion portable.

## Comparativa con modelos similares

No disponible. No existe categoria de modelos comparable porque el repositorio no contiene un modelo de IA. Cualquier comparacion con modelos de lenguaje, vision o agentes carece de sentido tecnico.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, arquitectura, tokenizador ni pipeline de inferencia.
- La model card describe un ejecutable de Windows distribuido como ZIP con contrasena (`2026`) y ejecucion como administrador, un patron habitual en campanas de malware.
- El contenido se presenta como herramienta de trampas (ESP y softaim) para Fortnite, lo que puede vulnerar los terminos de servicio del juego y acarrear el baneo de cuentas.
- Los enlaces de descarga apuntan a repositorios de GitHub de terceros no relacionados con el autor del repositorio de Hugging Face, lo que impide verificar procedencia e integridad.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- La licencia MIT declarada no aporta garantias sobre el binario ni sobre su legalidad en la jurisdiccion del usuario.
- Riesgo elevado de alucinacion si se interpreta la ficha como descripcion de un modelo: las cifras del README (descargas, valoracion, tamano) no son verificables.
- No debe ejecutarse el binario en entornos de produccion ni en maquinas con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/adeshbhagat/fortnite-external-box-esp-softaim-2026
- Enlace de descarga citado en la model card (GitHub de terceros): https://github.com/ekaterina96522/fisch-script-auto-catch-macro/releases/download/v1.2.0/fisch-script-auto-catch-macro-v1.2.2-win64.zip
- Repositorio de GitHub citado en la model card: https://github.com/hoangsharma42030/fortnite-external-box-esp-softaim-2026
- Releases del repositorio citado: https://github.com/hoangsharma42030/fortnite-external-box-esp-softaim-2026/releases/latest
