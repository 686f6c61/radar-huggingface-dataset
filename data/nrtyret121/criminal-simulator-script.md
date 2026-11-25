# nrtyret121/criminal-simulator-script

## Resumen

La entrada `nrtyret121/criminal-simulator-script` alojada en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un repositorio que distribuye un supuesto "script" o "trainer" para videojuegos, empaquetado como un archivo ZIP para Windows (`schedule-1-cheat-trainer-v1.2.2-win64.zip`, 4,8 MB) y protegido con contraseña. La model card describe funcionalidades propias de una herramienta de trampas para juegos: superposición externa a 144 Hz, cajas delimitadoras 2D/3D, esqueletos de huesos, radar 2D, filtro de botín y suavizado de entrada Bézier.

El repositorio no incluye pesos, arquitectura, tokenizador ni ningún artefacto propio de un modelo de lenguaje. Los tags de Hugging Face (`windows`, `x64`, `portable`, `criminal-simulator-script`) y los idiomas declarados (catorce, entre ellos inglés, ruso, chino, español, portugués, turco, alemán, francés, japonés, coreano, árabe, polaco, vietnamita e indonesio) corresponden a la metadata de la publicación, no a capacidades lingüísticas de un modelo. Las descargas y los "likes" registrados son cero en el momento de la consulta.

Por tanto, esta ficha documenta la naturaleza real del artefacto y advierte de los riesgos asociados. No es posible evaluar especificaciones técnicas de un modelo inexistente, y los datos que figuran a continuación reflejan únicamente lo que la model card declara sobre el binario distribuido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los idiomas declarados son metadata de la publicación, no capacidades del artefacto) |
| Licencia | MIT (según la model card) |
| Formato de pesos | no disponible (se distribuye un ZIP con un ejecutable `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento que describir. El artefacto distribuido es un ejecutable nativo de Windows x64 (`schedule-1-cheat-trainer-v1.2.2-win64.exe`, build `v3.4.2`, identificador `785C84`) empaquetado en un ZIP de 4,8 MB con contraseña de extracción `2026`. La model card menciona un "core externo en modo usuario" que renderiza mediante Desktop Duplication sin inyectar DLL en el proceso objetivo, con un consumo declarado inferior a 37 MB de RAM. No se aporta código fuente, ni build reproducible, ni firma del binario.

Los datos de entrenamiento, la composición del dataset, el número de tokens y cualquier técnica de alineación (RLHF, DPO) son inexistentes en este contexto. Las afirmaciones de rendimiento de la model card (respuesta en menos de 25 ms para la superposición, menos de 24 ms para el escáner de offsets, 99,1 % de consistencia en el filtro de botín) son declaraciones del autor sin verificación independiente y no constituyen métricas de un modelo.

## Capacidades

- No dispone de generación de texto, razonamiento, código, matemáticas ni visión en el sentido de un modelo de IA.
- La model card declara funcionalidades de trampa para videojuegos: superposición externa a 144 Hz con cajas 2D/3D, esqueletos de huesos y ESP de distancia.
- Radar 2D y filtro de botín por rareza con seguimiento de contenedores.
- Escáner dinámico de offsets con resolución automática de firmas de punteros tras parches del juego.
- Suavizado de entrada Bézier con radio de FOV configurable, VisCheck y curvas de objetivo humanizadas.
- Tecla de pánico (`END`) para descarga y cierre del proceso.
- No hay soporte de tool calling, function calling, agentes ni razonamiento multi-paso.

## Casos de uso

- No se identifican casos de uso legítimos para un modelo de IA, porque no lo es. Los escenarios que plantea la model card son incompatibles con un uso aceptable:
- Modificación de la memoria de un videojuego en ejecución para obtener ventaja competitiva: vulnera los términos de servicio de la práctica totalidad de juegos multijugador y puede acarrear el baneo permanente de la cuenta.
- Distribución de un binario sin firma ni código fuente a través de un ZIP protegido con contraseña: patrón habitual en campañas de malware, y el propio autor reconoce que Windows Defender y SmartScreen generan alertas.
- Uso en entornos corporativos o educativos: desaconsejado por completo; la ejecución como administrador de un binario no verificado supone un riesgo directo de compromiso del sistema.
- Análisis de malware en un entorno aislado: sería el único uso técnico razonable, siempre en una máquina virtual desechable y sin credenciales, para estudiar las técnicas de evasión que emplea.
- Investigación sobre ingeniería social en repositorios de Hugging Face: el caso ilustra cómo se abusa de plataformas de modelos para distribuir ejecutables mediante model cards llamativas.
- No se recomienda ningún despliegue productivo de este artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas cifras de la model card son declaraciones del autor sobre latencia del overlay (< 25 ms), del escáner de offsets (< 24 ms), consumo de RAM (< 37 MB) y consistencia del filtro de botín (99,1 %), sin metodología ni verificación independiente.

## Requisitos de hardware

- Sistema operativo: Windows 10 (22H2) o Windows 11 (24H2), arquitectura x64, según la model card.
- CPU: Intel o AMD x64; no se especifican requisitos mínimos.
- RAM: consumo declarado inferior a 37 MB para el proceso principal.
- GPU: no se especifican requisitos; la superposición usa Desktop Duplication, no aceleración por GPU dedicada.
- Almacenamiento: 4,8 MB para el ZIP; el espacio extraído no se detalla.
- Opciones de despliegue: ejecución directa del `.exe` como administrador; no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo las cifras declaradas por el autor, sin validación.

## Comparativa con modelos similares

No procede una comparativa con modelos de IA porque el artefacto no es un modelo. Frente a otros repositorios de la misma categoría (herramientas de trampas para juegos distribuidas en GitHub o foros), comparte patrón: binario cerrado, ZIP con contraseña, instrucciones para desactivar avisos de seguridad y ausencia de código fuente. No se dispone de datos verificables para establecer una comparación cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no procesa lenguaje natural pese a los idiomas declarados en la metadata.
- Riesgo de malware elevado: binario sin firma, sin código fuente y con contraseña de extracción, un patrón clásico para evadir el análisis automático de las plataformas.
- El autor reconoce que Windows Defender y SmartScreen emiten alertas y recomienda añadir exclusiones, lo que agrava el riesgo de seguridad.
- El uso de trampas en juegos multijugador vulnera los términos de servicio y puede implicar sanciones legales o contractuales según la jurisdicción y la plataforma.
- La licencia MIT declarada no exime del cumplimiento de la legislación aplicable sobre modificación de software de terceros ni de los contratos de usuario de los juegos.
- Cero descargas y cero "likes": sin evidencia de uso, auditoría ni comunidad que respalde el artefacto.
- La fecha de creación indicada (2026-11-24) es futura respecto a la fecha habitual de consulta, lo que sugiere metadata inconsistente o manipulada.
- No apto para producción, entornos corporativos ni equipos personales con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nrtyret121/criminal-simulator-script
- Enlace de descarga citado en la model card (no verificado): https://github.com/arjunzimmermann624/schedule-1-cheat-trainer/releases/download/v1.2.0/schedule-1-cheat-trainer-v1.2.2-win64.zip
- Repositorio de releases citado en la model card (no verificado): https://github.com/sandra95508/criminal-simulator-script/releases/latest
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
