# SherlockHolmes786/trading-dashboard

## Resumen

El repositorio `SherlockHolmes786/trading-dashboard` no es un modelo de inteligencia artificial, sino una aplicación web de panel de control para trading, desarrollada en Flask por el usuario Anuj Chaudhary (alias SherlockHolmes786). Se trata de una versión simplificada de un sistema de trading inspirado en un proyecto React llamado `tradewithlive` y en un sistema Flask previo llamado `ui-trading-system`. La aplicación permite gestionar influencers de trading, controlar el acceso a terminales privadas mediante códigos de acceso, visualizar pérdidas y ganancias en tiempo real, consultar el libro de órdenes y las operaciones recientes, e integrarse con la API de Zerodha Kite Connect.

Aunque no es un modelo de IA, su relevancia radica en que sirve como base para construir dashboards de trading con autenticación de usuarios, control de roles y preparación para integración con brokers reales. La aplicación está escrita en Python con Flask, utiliza almacenamiento en archivos JSON y no requiere dependencias complejas más allá de Flask y Werkzeug. El repositorio fue creado en agosto de 2026 y no ha recibido descargas ni valoraciones en Hugging Face, lo que sugiere que es un proyecto personal o de demostración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicacion web Flask (no es un modelo de IA) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (interfaz en ingles, segun el codigo) |
| Licencia | MIT (segun el README) |
| Formato de pesos | no disponible (no aplica; codigo fuente Python) |

## Arquitectura y entrenamiento

Al no ser un modelo de IA, no existe arquitectura neuronal ni proceso de entrenamiento. La aplicacion sigue un patron clasico de servidor web con Flask: rutas HTTP, plantillas HTML (login y dashboard), y almacenamiento de datos en archivos JSON dentro del directorio `data/`. La logica de negocio incluye autenticacion de usuarios con contrasenas hasheadas mediante Werkzeug, gestion de influencers (registro, aprobacion, bloqueo/desbloqueo), y endpoints para conectar/desconectar un broker Zerodha. No se utilizan tecnicas de aprendizaje automatico ni procesamiento de lenguaje natural.

## Capacidades

- Gestion de influencers de trading: registro, aprobacion administrativa y control de acceso a terminales privadas.
- Autenticacion de usuarios con roles (admin y usuario estandar) mediante sesiones.
- Visualizacion en tiempo real de perdidas y ganancias (P&L) de posiciones de trading.
- Libro de ordenes en vivo y flujo de operaciones recientes.
- Integracion preparada para la API de Zerodha Kite Connect (conexion y desconexion de broker).
- Generacion de datos simulados (mock data) para pruebas sin conexion real.
- Interfaz de usuario con tema oscuro y diseno glassmorphism.

## Casos de uso

- Prototipo de dashboard de trading para desarrolladores que quieran aprender Flask y la integracion con brokers indios como Zerodha.
- Base para un sistema de gestion de senales de trading: los influencers registran sus operaciones y los usuarios suscritos pueden verlas tras desbloquear con un codigo.
- Herramienta de demostracion para presentar conceptos de autenticacion basada en roles y control de acceso en aplicaciones web.
- Entorno de pruebas para conectar la API de Kite Connect sin necesidad de implementar toda la logica de trading desde cero.
- Plantilla para migrar a una base de datos SQLite/PostgreSQL y anadir WebSocket para actualizaciones en tiempo real.
- Recurso educativo para entender la estructura de un proyecto Flask con separacion de rutas, plantillas y almacenamiento en archivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de una aplicacion web y no de un modelo de IA, no existen metricas de rendimiento como MMLU, HumanEval o GSM8K. El rendimiento de la aplicacion dependera del hardware donde se ejecute y de la carga de usuarios, pero al usar almacenamiento JSON y polling, no esta disenada para alta concurrencia.

## Requisitos de hardware

- No requiere GPU ni hardware especializado; es una aplicacion Python estandar.
- Puede ejecutarse en cualquier maquina con Python 3.x y las dependencias de `requirements.txt` (Flask y Werkzeug).
- Para desarrollo local, basta con un ordenador personal; para produccion, se recomienda un servidor con al menos 1 GB de RAM y un proxy inverso como Nginx.
- Opciones de despliegue: servidor Flask integrado (para pruebas), Gunicorn + Nginx (para produccion), o contenedores Docker.
- Latencia y throughput: no disponibles, pero al usar polling, la frecuencia de actualizacion depende del cliente.

## Comparativa con modelos similares

No aplica directamente, ya que no es un modelo de IA. Sin embargo, se puede comparar con otros proyectos de dashboard de trading:

| Proyecto | Tipo | Framework | Caracteristicas principales |
|---|---|---|---|
| trading-dashboard (este) | Aplicacion web | Flask | Simplificado, sin estrategias de trading, almacenamiento JSON |
| tradewithlive (React) | Aplicacion web | React | Frontend moderno, requiere build, mismas funcionalidades core |
| ui-trading-system (Flask original) | Aplicacion web | Flask | Incluia logica de trading algoritmico, mas complejo |
| AI-Trading-Analyzer-Dashboard | Aplicacion con IA | Python, SQL, Power BI, Streamlit, LSTM | Prediccion de acciones con LSTM, analitica en tiempo real |

## Limitaciones y advertencias

- No es un modelo de IA: no realiza predicciones, analisis de sentimiento ni generacion de texto.
- Almacenamiento en archivos JSON: no es escalable para multiples usuarios concurrentes; se recomienda migrar a una base de datos.
- Sin WebSocket: las actualizaciones en tiempo real se basan en polling, lo que puede generar latencia y carga innecesaria.
- Credenciales por defecto (admin@trading.com / admin123) son inseguras para produccion; deben cambiarse.
- La integracion con Zerodha esta "preparada" pero no implementada; requiere desarrollo adicional para conectar con la API real.
- No hay soporte para otros brokers ni para operaciones de compra/venta directas.
- El proyecto no tiene descargas ni comunidad activa en Hugging Face, por lo que el soporte es limitado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SherlockHolmes786/trading-dashboard
- Perfil del autor en Hugging Face: https://huggingface.co/SherlockHolmes786/models
- Proyecto relacionado del autor: https://huggingface.co/SherlockHolmes786/Onnx_wasm
- Sherlock.ai (plataforma de modelos financieros, no relacionada directamente): https://www.sherlockai.app/dashboard
- Proyecto similar en GitHub (AI-Trading-Analyzer-Dashboard): https://github.com/Sheshagir/AI-Trading-Analyzer-Dashboard
