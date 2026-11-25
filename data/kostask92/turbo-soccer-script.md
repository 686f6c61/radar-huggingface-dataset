# kostask92/turbo-soccer-script

## Resumen

`kostask92/turbo-soccer-script` es un repositorio alojado en Hugging Face que, pese a su ubicación en la plataforma, no contiene un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows x64 distribuido como archivo ZIP (`monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.zip`, 4,8 MB) que, según su propia model card, implementa funcionalidades de tipo *cheat* o *trainer* para videojuegos: superposición externa (*overlay*), ESP de cajas delimitadoras y esqueletos, radar 2D, suavizado de entrada tipo Bézier y escaneo dinámico de offsets de memoria.

El repositorio no declara arquitectura de red neuronal, parámetros, longitud de contexto ni formato de pesos. Los tags de Hugging Face (`windows`, `windows-11`, `x64`, `portable`) y el contenido del README confirman que se trata de un binario portable, no de un modelo entrenado. La licencia declarada es MIT, aunque el propio binario se distribuye con contraseña de extracción (`2026`) y se aloja en repositorios de GitHub de terceros.

La relevancia de esta ficha es, por tanto, fundamentalmente documental y de advertencia: sirve para identificar que el artefacto no es un modelo evaluable y que su descarga conlleva riesgos de seguridad significativos (ejecutable sin firma, ofuscación mediante contraseña, alertas de SmartScreen reconocidas por el autor).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Win64) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo; no aplica a un modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye como ZIP con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un binario compilado para Windows x64 que, de acuerdo con la model card, opera en modo usuario (*user-mode external core*) mediante Desktop Duplication API para el renderizado de superposiciones, sin inyección de DLL en el proceso objetivo. El autor menciona un sondeo (*polling*) de offsets a 183 Hz, un escáner dinámico de firmas de punteros a 151 Hz, 11 hilos de trabajo y un consumo declarado inferior a 27 MB de RAM.

Tampoco hay dataset, tokens de entrenamiento, RLHF ni DPO. Las "innovaciones" descritas (exclusión de captura en OBS/ShadowPlay/Discord, suavizado Bézier de la mira, radar 2D con filtrado por rareza) son funcionalidades de un *cheat*, no contribuciones técnicas de aprendizaje automático.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta *tool calling* ni *function calling*.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los idiomas listados son metadatos del repositorio.
- Funcionalidad declarada por el autor (no verificada): superposición externa a 144 Hz o más con cajas 2D/3D, esqueletos y ESP de distancia.
- Radar 2D con filtrado de objetos por rareza y seguimiento de contenedores.
- Escáner dinámico de offsets para sobrevivir a parches del juego.
- Suavizado de entrada Bézier con radio de FOV configurable y comprobación de visibilidad (*VisCheck*).
- Exclusión de la superposición en capturas de OBS, ShadowPlay y Discord.

## Casos de uso

- **Auditoría de seguridad de artefactos en Hugging Face**: usar esta ficha como referencia para clasificar el repositorio como no-modelo y aplicar políticas de cuarentena en pipelines de escaneo de dependencias.
- **Formación en detección de malware**: el patrón (ZIP con contraseña, ejecutable sin firma, README con insignias falsas de descargas y valoraciones) es un caso didáctico habitual en cursos de análisis de amenazas.
- **Investigación sobre abuso de plataformas de modelos**: documentar cómo se emplean repositorios de Hugging Face para distribuir binarios ajenos al ecosistema de IA.
- **Verificación de políticas de licencia**: comprobar que la etiqueta MIT no otorga garantías sobre el binario y que su uso puede infringir los términos de servicio de los videojuegos objetivo.
- **Análisis de ingeniería social**: estudiar el uso de contraseñas de extracción y enlaces a repositorios de GitHub de terceros como vectores de distribución.
- **Respuesta a incidentes**: identificar indicadores de compromiso (nombre del ZIP, contraseña `2026`, build `9F2DD3`, rutas de GitHub citadas) para bloquear en proxies y EDR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor cita cifras internas no verificables (183 Hz de sondeo, 151 Hz de escaneo, menos de 8 ms de respuesta, 99,7 % de consistencia, menos de 27 MB de RAM), pero no son benchmarks de modelo ni han sido auditados de forma independiente.

## Requisitos de hardware

- No aplica VRAM: no es un modelo de IA.
- Sistema operativo: Windows 10 u 11 de 64 bits (según el autor).
- CPU/RAM: el autor declara menos de 27 MB de RAM y 11 hilos de trabajo; no se especifican requisitos de CPU ni de GPU.
- GPU: no se requiere GPU dedicada para el binario; la superposición usa Desktop Duplication.
- Despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI. La distribución es un ZIP con un `.exe` que el autor indica ejecutar como administrador.
- Latencia y throughput: no disponibles de forma verificable.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable: el artefacto no es un modelo de IA y no se han identificado alternativas equivalentes en la información proporcionada.

## Limitaciones y advertencias

- **No es un modelo de IA**: no debe evaluarse con métricas de MMLU, HumanEval, GSM8K ni similares.
- **Riesgo de seguridad alto**: ejecutable sin firma, distribuido dentro de un ZIP protegido con contraseña (`2026`), lo que impide el escaneo automático por antivirus y motores de análisis.
- **Suplantación de identidad**: el README enlaza a repositorios de GitHub de terceros (`martina1713/monster-hunter-wilds-trainer-mod-2026`, `JohanRonto570/turbo-soccer-script`) que no coinciden con el autor del repositorio en Hugging Face.
- **Indicadores engañosos**: insignias de "593K+ descargas" y "4,9/5" que no se corresponden con las 0 descargas y 0 likes reales del repositorio.
- **Posible infracción de términos de servicio**: el propio autor lo describe como *game cheat*, lo que puede contravenir las condiciones de uso de los videojuegos objetivo y la legislación aplicable en algunas jurisdicciones.
- **Licencia**: MIT declarada, pero sin garantías sobre el binario; la licencia no exime de responsabilidad por el uso del ejecutable.
- **Sesgos y alucinaciones**: no aplica al no ser un modelo generativo; los riesgos son de malware, no de calidad de salida.
- **Recomendación**: no ejecutar el binario en entornos de producción ni en máquinas con datos sensibles; si se manipula por motivos de investigación, hacerlo en una máquina virtual aislada y sin red.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kostask92/turbo-soccer-script
- Repositorio de GitHub citado por el autor (descarga del ZIP): https://github.com/martina1713/monster-hunter-wilds-trainer-mod-2026/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.zip
- Repositorio de GitHub citado por el autor (página de releases): https://github.com/JohanRonto570/turbo-soccer-script/releases/latest
- Paper: no disponible
- Blog o demo: no disponible
