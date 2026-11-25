# CCr33/uncharted-legacy-of-thieves-collecti-cheat

## Resumen

El repositorio `CCr33/uncharted-legacy-of-thieves-collecti-cheat` no contiene un modelo de inteligencia artificial. Se trata de un paquete de software empaquetado para Windows x64 que la model card presenta como un "cheat trainer" para el videojuego *Uncharted: Legacy of Thieves Collection*, con módulos de overlay, radar 2D, suavizado de entrada y escaneo de offsets. No hay pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia: el campo `pipeline` aparece como "no disponible" y el repositorio no expone ficheros propios de un modelo (safetensors, GGUF, config.json, etc.).

La ficha se ha redactado siguiendo la estructura obligatoria, pero la práctica totalidad de los apartados técnicos propios de un modelo (arquitectura, parámetros, contexto, cuantización, benchmarks, requisitos de VRAM) no son aplicables y se marcan como "no disponible". El contenido de la model card es, además, incoherente: el enlace de descarga apunta a un binario con nombre `pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.exe`, sin relación con el título del repositorio, y solicita una contraseña de archivo. Esta discrepancia es una señal de alarma clásica de distribución de software potencialmente malicioso.

Por tanto, esta ficha debe leerse como una evaluación de riesgo y no como una evaluación de capacidades de IA. No se recomienda su descarga ni ejecución en entornos de desarrollo o investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio distribuye un ejecutable `.exe` y un `.zip`) |

## Arquitectura y entrenamiento

No aplica. No existe arquitectura de red neuronal, corpus de entrenamiento, proceso de alineación (RLHF/DPO) ni innovación técnica de modelado que evaluar. El artefacto descrito en la model card es un ejecutable Win64 (`pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.exe`, build `v4.5.9 (097175)`) empaquetado en un ZIP de 4,8 MB protegido con contraseña, que según el autor requiere ejecución como administrador y realiza manipulación de memoria de un proceso de juego (escaneo de offsets, overlay externo, radar 2D).

Los "módulos" listados (suavizado de entrada bezier a 407 Hz, capa de render excluida de capturas, overlay a 144 Hz con cajas 2D/3D, escáner de offsets con 96,6 % de consistencia, radar 2D con filtro de loot y perfiles JSON con cambio en caliente) son funcionalidades de un trainer/cheat, no capacidades de un modelo. No hay información verificable sobre su implementación interna.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en el sentido de un LLM; los idiomas listados son metadatos del repositorio.
- No dispone de modo thinking, visión, audio ni ninguna modalidad de IA.
- Funcionalidad declarada por el autor (no verificada): overlay externo, radar 2D, filtro de loot, perfiles JSON conmutables y escaneo de offsets.

## Casos de uso

- No se identifican casos de uso legítimos para desarrolladores o investigadores de IA. El artefacto no resuelve ningún problema de procesamiento de lenguaje, visión o generación.
- Uso declarado por el autor: manipulación de un videojuego de un solo jugador mediante un trainer externo. Este uso queda fuera del ámbito de esta publicación y puede contravenir los términos de servicio de la plataforma del juego.
- Auditoría de seguridad: un analista podría estudiar el paquete en un entorno aislado (sandbox, máquina virtual sin red) para caracterizar el binario, pero esto no constituye un caso de uso del modelo.
- Detección de campañas de distribución de malware: el patrón (nombre de repositorio incoherente con el binario, contraseña en el README, enlaces a releases de terceros, insignias de descargas infladas) es útil como ejemplo de ingeniería social para formar a equipos de seguridad.
- No se recomienda su uso en producción, CI/CD, atención al cliente ni en ningún pipeline de datos.
- No se recomienda su instalación en equipos de trabajo, portátiles de desarrollo ni servidores compartidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de MMLU, HumanEval, GSM8K ni equivalentes, porque el artefacto no es un modelo evaluable. Las cifras que aparecen en la model card (407 Hz de polling, menos de 4 ms de respuesta, menos de 34 MB y 47 MB de RAM, 96,6 % de consistencia) son afirmaciones del autor sobre el software, no resultados de benchmarks de IA, y no se han podido verificar.

## Requisitos de hardware

- VRAM: no aplica; no hay inferencia de modelo.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma objetivo declarada: Windows 10 y Windows 11 de 64 bits (x64).
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras del README no son verificables.
- Consumo de disco declarado del paquete: 4,8 MB.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos de IA comparable, ya que el artefacto no es un modelo. A modo de contraste puramente estructural, se indica lo siguiente:

| Criterio | Este repositorio | Modelo de IA típico en Hugging Face |
|---|---|---|
| Contenido | Ejecutable `.exe` + ZIP | Pesos safetensors/GGUF + config |
| Pipeline | no disponible | text-generation, image-text-to-text, etc. |
| Evaluable con benchmarks | No | Sí |
| Reproducibilidad | No | Alta (pesos versionados) |
| Riesgo de seguridad al instalar | Alto (binario opaco, contraseña, admin) | Bajo (pesos de solo lectura) |

## Limitaciones y advertencias

- No es un modelo de IA: cualquier expectativa de generación de texto, código o razonamiento es infundada.
- Incoherencia grave entre el nombre del repositorio y el binario distribuido (`pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.exe`), lo que sugiere reutilización de plantilla o suplantación.
- Distribución de un ejecutable opaco protegido con contraseña y con instrucciones para ejecutarlo como administrador: vector habitual de malware, stealers o ransomware.
- Los enlaces de descarga apuntan a releases de cuentas de GitHub distintas de la del autor del repositorio, lo que impide verificar la cadena de custodia del binario.
- Las insignias de descargas (722K+) y tamaño no son verificables y contradicen el contador real de descargas de Hugging Face (0).
- Licencia MIT declarada, pero sin fichero de licencia ni código fuente que la respalde; la licencia no cubre responsabilidad alguna sobre el binario.
- Posible incumplimiento de los términos de servicio del videojuego y de la legislación sobre software de trampa en determinadas jurisdicciones.
- Riesgo de alucinación: no aplica; el riesgo real es de ejecución de código no verificado.
- No usar en producción, ni en equipos con credenciales, ni en redes corporativas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/CCr33/uncharted-legacy-of-thieves-collecti-cheat
- Enlace de descarga citado en la model card (no verificado, no recomendado): https://github.com/carlos7088/pump-fun-jito-bundler-sniper-bot-2026/releases/download/v1.2.0/pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.zip
- Releases citadas en la model card (no verificadas): https://github.com/parker41309/uncharted-legacy-of-thieves-collecti-cheat-trainer/releases/latest
- Paper, blog, demo o repositorio de código del modelo: no disponible.
