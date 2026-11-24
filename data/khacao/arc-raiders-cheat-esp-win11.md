# Khacao/arc-raiders-cheat-esp-win11

## Resumen

`Khacao/arc-raiders-cheat-esp-win11` es un repositorio alojado en Hugging Face que no contiene un modelo de inteligencia artificial, sino un paquete ejecutable para Windows etiquetado como *cheat* (trampa) con funcionalidad ESP (Extra Sensory Perception) dirigido al videojuego Arc Raiders. El autor, identificado como Khacao, publica el artefacto bajo licencia MIT y lo etiqueta con lenguajes y plataformas que no se corresponden con un modelo de lenguaje: los tags incluyen `windows`, `windows-11`, `x64` y `portable`, y la model card describe un binario `.exe` de 4,8 MB distribuido en un archivo ZIP protegido con contraseña.

La pieza central del repositorio es una model card promocional que documenta supuestas capacidades de trampa: radar 2D, filtrado de botín, suavizado de entrada Bézier, overlay externo a 144 Hz, escáner dinámico de offsets y una capa de renderizado "stream-proof" para evadir capturas de OBS, ShadowPlay y Discord. El binario referenciado se denomina `deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.exe`, nombre que mezcla el título Deadlock con Arc Raiders, lo que sugiere una plantilla reutilizada entre distintos repositorios de la misma red.

Desde la perspectiva de un catálogo de modelos open source, este repositorio no es un modelo: carece de arquitectura, pesos, tokenizador, pipeline o cualquier artefacto de aprendizaje automático. Es relevante únicamente como ejemplo de contaminación de plataformas de modelos con contenido de malware o trampas para videojuegos, y debe tratarse con la máxima cautela: el ejecutable distribuido por enlaces externos y protegido con contraseña constituye un vector clásico de distribución de software malicioso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Win64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según tags del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un `.exe` y un `.zip` de 4,8 MB) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un binario ejecutable para Windows x64 (`deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.exe`, build `v1.5.5` / `104EE23F93`) empaquetado en un ZIP de 4,8 MB con contraseña `2026`. La model card describe módulos de manipulación de memoria de proceso (escáner dinámico de offsets, resolución automática de firmas de punteros), un overlay de renderizado externo con cajas 2D/3D y esqueletos de huesos, y un sistema de suavizado de entrada Bézier con radio de FOV configurable y comprobación de visibilidad. Ninguno de estos componentes es verificable a partir de los metadatos del repositorio, y las cifras de "consistencia" (96,8 %, 97,4 %) que aparecen en la model card no cuentan con metodología publicada.

El repositorio no incluye dataset, tokens de entrenamiento, técnicas de alineación (RLHF, DPO) ni innovaciones de inferencia. Los enlaces de descarga apuntan a un repositorio de GitHub de terceros (`rocha1838/deadlock-cheat-esp-aimbot-2026`) y a una release de `kaitobrouwer529/arc-raiders-cheat-esp-win11`, lo que indica una cadena de distribución ajena a Hugging Face.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los idiomas listados son etiquetas de metadatos sin respaldo funcional.
- No dispone de modo *thinking*, visión, audio ni ninguna modalidad de IA.
- El binario declara, según su propia model card, funciones de trampa en el videojuego Arc Raiders: radar 2D, filtro de botín por rareza, ESP de cajas y esqueletos, suavizado de puntería y tecla de pánico (`END`).
- Declara una capa de evasión de captura de pantalla para OBS, ShadowPlay y Discord.

## Casos de uso

- Ninguno legítimo en el ámbito de IA, desarrollo o investigación. El repositorio no ofrece ningún artefacto reutilizable como modelo.
- Auditoría de seguridad: un equipo de seguridad puede analizar el binario en un entorno aislado para caracterizar la familia de malware o el *dropper* que distribuye.
- Estudio de contaminación de plataformas: sirve como caso de ejemplo de repositorios que abusan de Hugging Face para posicionar descargas de software no relacionado con IA.
- Monitorización de comunidades de trampas: permite a los equipos anti-cheat identificar nombres de binarios, builds y cadenas de distribución reutilizadas entre títulos.
- Formación en concienciación: útil como muestra didáctica de ingeniería social (contraseña en la propia página, insignias falsas de descargas y valoraciones) para talleres de seguridad.
- Investigación de redes de repositorios: el patrón de nombres cruzados (Deadlock en un paquete de Arc Raiders) ayuda a rastrear campañas de repositorios clonados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (96,8 % y 97,4 % de "consistencia", uso de menos de 31 MB y 49 MB de RAM) son afirmaciones del autor sin metodología, conjunto de prueba ni reproducibilidad, por lo que no deben considerarse benchmarks.

## Requisitos de hardware

- Plataforma objetivo declarada: Windows 10 y Windows 11 de 64 bits.
- VRAM estimada: no aplica (no hay inferencia de modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna; el artefacto es un `.exe` de Windows.
- Latencia y throughput: no disponibles; las menciones a "144 Hz+" y "cero picos de frame-time" son afirmaciones del autor sin verificación.
- Consumo de RAM declarado por el autor: menos de 31 MB para el módulo de radar y menos de 49 MB para la capa de renderizado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Khacao/arc-raiders-cheat-esp-win11` | Ejecutable Win64 (no IA) | no disponible | no disponible | MIT | Hugging Face + enlaces externos a GitHub |
| Modelo de lenguaje open source de propósito general | Transformer | no disponible en esta ficha | no disponible | variable | Hugging Face |
| Modelo de código open source | Transformer | no disponible en esta ficha | no disponible | variable | Hugging Face |

No existe una categoría de "modelos similares" en el sentido de IA: los comparables serían otros repositorios de trampas para videojuegos, para los que no se dispone de datos verificables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, integrarse ni desplegarse como tal en ningún pipeline de datos, NLP o visión.
- Riesgo de seguridad alto: el paquete se distribuye como ZIP con contraseña y ejecutable que requiere "Ejecutar como administrador", un patrón habitual de distribución de malware.
- El binario se aloja fuera de Hugging Face (GitHub de terceros), por lo que el contenido puede cambiar sin relación con los metadatos del repositorio.
- La licencia MIT declarada no otorga ninguna garantía sobre el binario ni sobre su comportamiento en ejecución.
- Uso en videojuegos: la trampa en Arc Raiders vulnera los términos de servicio del juego y puede conllevar el baneo permanente de cuentas; en algunas jurisdicciones el desarrollo y distribución de cheats puede tener implicaciones legales.
- Los idiomas listados en los tags no implican soporte real de localización.
- Las cifras de rendimiento, descargas (924K+) y valoración (4,8/5) de la model card no son verificables y presentan indicios de fabricación.
- No apto para producción en ningún contexto legítimo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Khacao/arc-raiders-cheat-esp-win11
- Repositorio GitHub referenciado en la model card: https://github.com/rocha1838/deadlock-cheat-esp-aimbot-2026
- Release referenciada: https://github.com/kaitobrouwer529/arc-raiders-cheat-esp-win11/releases/latest
- Documentación de Hugging Face sobre seguridad y repositorios: https://huggingface.co/docs/hub/security
- No se han encontrado papers, blogs ni demos técnicas asociadas en la información proporcionada.
